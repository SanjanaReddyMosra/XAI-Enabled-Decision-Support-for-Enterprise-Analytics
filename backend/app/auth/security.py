import os
from pathlib import Path
from dotenv import load_dotenv
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

# Load root .env consistently
_root_dir = Path(__file__).resolve().parent.parent.parent.parent
_env_path = _root_dir / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)
else:
    load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").strip().lower()
RAW_JWT_SECRET = os.getenv("JWT_SECRET_KEY", "").strip()

INSECURE_SECRETS = {
    "xai-enterprise-secret-key-decision-intelligence-2026-production-grade",
    "secret",
    "changeme",
    "your-secret-key",
    "test-secret",
    "password"
}

if ENVIRONMENT in ("production", "prod"):
    if not RAW_JWT_SECRET:
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET_KEY must be configured via environment in production."
        )
    if RAW_JWT_SECRET in INSECURE_SECRETS or len(RAW_JWT_SECRET) < 32:
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET_KEY in production must be a cryptographically strong secret of at least 32 characters and cannot use sample/insecure defaults."
        )
    JWT_SECRET_KEY = RAW_JWT_SECRET
else:
    # Development / Testing fallback
    JWT_SECRET_KEY = RAW_JWT_SECRET or "dev-insecure-only-local-testing-secret-key-min-32-chars"

JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256").strip()
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# Cookie Security: Secure & SameSite=None for HTTPS production; False & SameSite=Lax for HTTP development
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "").strip().lower() in ("true", "1", "yes") or ENVIRONMENT in ("production", "prod")
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "none" if COOKIE_SECURE else "lax").strip()

def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt with 12 salt rounds."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Safely verifies a candidate plaintext password against stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Encodes user identity and claims into a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow()
    })
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and cryptographically verifies a JWT access token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        return None
