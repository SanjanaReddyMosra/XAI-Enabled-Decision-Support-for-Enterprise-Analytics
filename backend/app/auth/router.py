from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from backend.app.auth.dependencies import get_db, get_current_user
from backend.app.auth.models import User
from backend.app.auth.schemas import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    UserResponse,
    ProfileUpdateRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse
)
from backend.app.auth.service import (
    register_user,
    authenticate_user,
    update_user_profile,
    change_user_password,
    request_password_reset
)

auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@auth_router.get("/health")
def auth_health():
    """Health check endpoint for authentication subsystem."""
    return {
        "status": "healthy",
        "service": "XAI Enterprise Authentication & Access Management",
        "version": "1.0.0"
    }

@auth_router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registers a new enterprise user.
    Validates all mandatory fields, enforces strong password policy,
    hashes credentials on the backend via bcrypt, and persists the user record.
    """
    result = register_user(db, payload)
    return result

@auth_router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """
    Authenticates user credentials and generates a signed JWT access token.
    Updates last_login timestamp and sets a secure HttpOnly cookie.
    """
    result = authenticate_user(db, payload)
    
    # Set HttpOnly cookie for production session security
    max_age = 7 * 86400 if payload.remember_me else 86400
    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        httponly=True,
        max_age=max_age,
        samesite="lax",
        secure=False  # True in production HTTPS
    )
    
    return result

@auth_router.post("/logout")
def logout(response: Response):
    """Clears authentication cookies and invalidates local session."""
    response.delete_cookie(key="access_token")
    return {
        "success": True,
        "message": "Successfully signed out."
    }

@auth_router.get("/me", response_model=UserResponse)
def get_current_profile(current_user: User = Depends(get_current_user)):
    """Returns currently authenticated user profile without exposing credentials."""
    return current_user.to_dict()

@auth_router.put("/profile", response_model=UserResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates permitted non-sensitive personal and professional profile details."""
    updated = update_user_profile(db, current_user, payload)
    return updated

@auth_router.put("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verifies existing password and updates to a newly validated bcrypt hash."""
    result = change_user_password(db, current_user, payload)
    return result

@auth_router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Handles password reset request securely without leaking user existence."""
    result = request_password_reset(db, payload.email)
    return result
