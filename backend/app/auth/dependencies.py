from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.app.db.database import SessionLocal
from backend.app.auth.models import User
from backend.app.auth.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_db():
    """Database session generator dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def extract_token_from_request(request: Request, bearer_token: Optional[str] = None) -> Optional[str]:
    """Extracts JWT token from Authorization header or HttpOnly cookie."""
    if bearer_token:
        return bearer_token
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1]
    # Check cookie fallback
    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        return cookie_token
    return None

def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Dependency that extracts, verifies JWT token, and returns active User."""
    actual_token = extract_token_from_request(request, token)
    
    unauthorized_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required. Please sign in to access this resource.",
        headers={"WWW-Authenticate": "Bearer"}
    )

    if not actual_token:
        raise unauthorized_exc

    payload = decode_access_token(actual_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or token is invalid. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user_id = payload.get("user_id")
    if not user_id:
        raise unauthorized_exc

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise unauthorized_exc

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive. Please contact administration."
        )

    return user

def get_optional_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Returns User if authenticated, otherwise None without raising an exception."""
    try:
        return get_current_user(request, token, db)
    except HTTPException:
        return None

def require_admin(user: User = Depends(get_current_user)) -> User:
    """Dependency that restricts access to admin accounts."""
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required."
        )
    return user
