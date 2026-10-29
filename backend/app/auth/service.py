import os
from datetime import datetime, timedelta
from sqlalchemy import or_
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.auth.models import User
from backend.app.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    ProfileUpdateRequest,
    ChangePasswordRequest
)
from backend.app.auth.security import (
    hash_password,
    verify_password,
    create_access_token
)

def register_user(db: Session, req: RegisterRequest) -> dict:
    """Registers a new enterprise user after uniqueness and security validation."""
    clean_email = req.email.strip().lower()
    clean_username = req.username.strip().lower()

    # 1. Uniqueness check for email
    existing_email = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered."
        )

    # 2. Uniqueness check for username
    existing_username = db.query(User).filter(User.username.ilike(clean_username)).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken."
        )

    # 3. Secure password hashing on backend via bcrypt
    hashed_pwd = hash_password(req.password)

    # 4. Instantiate user with enforced 'user' role
    now = datetime.utcnow()
    user = User(
        first_name=req.first_name.strip(),
        last_name=req.last_name.strip(),
        date_of_birth=req.date_of_birth.strip(),
        gender=req.gender.strip(),
        phone=req.phone.strip(),
        email=clean_email,
        organization=req.organization.strip(),
        job_title=req.job_title.strip(),
        department=req.department.strip(),
        years_of_experience=req.years_of_experience,
        username=clean_username,
        password_hash=hashed_pwd,
        role="user",  # Security: never allow public registration of admin
        is_active=True,
        terms_accepted_at=now if req.terms_accepted else None,
        created_at=now,
        updated_at=now
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "Account created successfully"
    }

def authenticate_user(db: Session, req: LoginRequest) -> dict:
    """Authenticates credentials, updates login timestamp, and issues JWT token."""
    identifier = req.username_or_email.strip().lower()

    # Generic error message to prevent account enumeration
    auth_failure = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid username/email or password.",
        headers={"WWW-Authenticate": "Bearer"}
    )

    # Find user by email or username
    user = db.query(User).filter(
        or_(
            User.email.ilike(identifier),
            User.username.ilike(identifier)
        )
    ).first()

    if not user:
        raise auth_failure

    if not verify_password(req.password, user.password_hash):
        raise auth_failure

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive. Please contact system administration."
        )

    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    # Calculate token duration based on 'remember_me'
    token_duration = timedelta(days=7) if req.remember_me else timedelta(hours=24)
    token_data = {
        "sub": user.username,
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name
    }

    access_token = create_access_token(token_data, expires_delta=token_duration)

    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.to_dict()
    }

def update_user_profile(db: Session, user: User, req: ProfileUpdateRequest) -> dict:
    """Updates permitted non-sensitive profile attributes."""
    if req.first_name is not None:
        user.first_name = req.first_name.strip()
    if req.last_name is not None:
        user.last_name = req.last_name.strip()
    if req.phone is not None:
        user.phone = req.phone.strip()
    if req.organization is not None:
        user.organization = req.organization.strip()
    if req.job_title is not None:
        user.job_title = req.job_title.strip()
    if req.department is not None:
        user.department = req.department.strip()
    if req.years_of_experience is not None:
        user.years_of_experience = req.years_of_experience

    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)

    return user.to_dict()

def change_user_password(db: Session, user: User, req: ChangePasswordRequest) -> dict:
    """Verifies existing password and securely sets new password hash."""
    if not verify_password(req.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )

    user.password_hash = hash_password(req.new_password)
    user.updated_at = datetime.utcnow()
    db.commit()

    return {
        "success": True,
        "message": "Password changed successfully."
    }

def request_password_reset(db: Session, email: str) -> dict:
    """
    Handles password recovery requests.
    If SMTP email delivery is configured, generates a secure, signed, time-limited token
    and dispatches a password reset email.
    If email delivery is not configured, explicitly returns an accurate notice that email
    recovery is unavailable on this instance rather than deceptively implying an email was sent.
    """
    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_user = os.getenv("SMTP_USER", "").strip()

    if not smtp_host or not smtp_user:
        return {
            "success": False,
            "available": False,
            "message": "Password recovery via email is currently unavailable because SMTP email delivery is not configured on this server. Please contact your system administrator to reset your credentials."
        }

    clean_email = email.strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()

    if user and user.is_active:
        from backend.app.auth.security import JWT_SECRET_KEY, JWT_ALGORITHM
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        # Generate a 1-hour secure signed reset token
        reset_payload = {
            "sub": str(user.id),
            "email": user.email,
            "type": "password_reset",
            "exp": datetime.utcnow() + timedelta(hours=1),
            "iat": datetime.utcnow()
        }
        reset_token = jwt.encode(reset_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        frontend_url = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        
        try:
            smtp_port = int(os.getenv("SMTP_PORT", "587"))
            smtp_pass = os.getenv("SMTP_PASSWORD", "")
            smtp_from = os.getenv("SMTP_FROM", smtp_user)
            
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "XAI Decision Platform — Password Reset Request"
            msg["From"] = smtp_from
            msg["To"] = user.email
            
            text_body = f"Hello {user.first_name},\n\nA password reset was requested for your account.\nUse the following secure link to reset your password:\n{reset_link}\n\nThis link expires in 60 minutes.\nIf you did not request this, please ignore this email."
            msg.attach(MIMEText(text_body, "plain"))
            
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_from, [user.email], msg.as_string())
        except Exception as e:
            print("Password reset email dispatch failure:", e)
            return {
                "success": False,
                "available": True,
                "message": f"Failed to dispatch reset email: {e}"
            }

    return {
        "success": True,
        "available": True,
        "message": "If an account matches that email address, password recovery instructions have been sent."
    }
