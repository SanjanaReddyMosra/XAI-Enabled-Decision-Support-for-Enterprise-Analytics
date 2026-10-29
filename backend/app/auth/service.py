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
    """Safely handles password recovery requests without leaking account existence."""
    clean_email = email.strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    # In enterprise production, send an email with a secure time-limited token.
    # We return a generic message to prevent account discovery.
    return {
        "success": True,
        "message": "If an account matches that email address, password recovery instructions have been initiated."
    }
