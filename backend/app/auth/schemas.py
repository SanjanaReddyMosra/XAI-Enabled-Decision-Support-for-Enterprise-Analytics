import re
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$")
USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9_.-]{3,30}$")
PHONE_REGEX = re.compile(r"^\+?[0-9\s\-()]{7,20}$")

class RegisterRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: str = Field(..., description="Format: YYYY-MM-DD")
    gender: str = Field(..., min_length=1, max_length=50)
    phone: str = Field(..., min_length=7, max_length=30)
    email: EmailStr
    organization: str = Field(..., min_length=1, max_length=150)
    job_title: str = Field(..., min_length=1, max_length=150)
    department: str = Field(..., min_length=1, max_length=100)
    years_of_experience: float = Field(..., ge=0, le=70)
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: Optional[str] = None
    terms_accepted: bool = Field(..., description="Must accept Terms of Service")
    privacy_accepted: Optional[bool] = False

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        clean = v.strip()
        if not USERNAME_REGEX.match(clean):
            raise ValueError("Username must be 3-30 characters and contain only letters, numbers, underscores, dots, or hyphens.")
        return clean.lower()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        clean = v.strip()
        if not PHONE_REGEX.match(clean):
            raise ValueError("Please provide a valid phone number.")
        return clean

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not PASSWORD_REGEX.match(v):
            raise ValueError(
                "Password must contain at least 8 characters, including at least one uppercase letter, "
                "one lowercase letter, one number, and one special character."
            )
        return v

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        allowed = {"male", "female", "other", "prefer not to say"}
        clean = v.strip().lower()
        if clean not in allowed:
            raise ValueError("Gender must be one of: Male, Female, Other, Prefer not to say.")
        return v.strip()

    @field_validator("terms_accepted")
    @classmethod
    def validate_terms(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must agree to the Terms of Service to register.")
        return v

    @model_validator(mode="after")
    def check_passwords_match(self):
        if self.confirm_password is not None and self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self

class LoginRequest(BaseModel):
    username_or_email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)
    remember_me: Optional[bool] = False

class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    date_of_birth: str
    gender: str
    phone: str
    email: str
    organization: str
    job_title: str
    department: str
    years_of_experience: float
    username: str
    role: str
    is_active: bool
    terms_accepted_at: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    last_login: Optional[str] = None

class LoginResponse(BaseModel):
    success: bool = True
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class RegisterResponse(BaseModel):
    success: bool = True
    message: str = "Account created successfully"

class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, min_length=7, max_length=30)
    organization: Optional[str] = Field(None, min_length=1, max_length=150)
    job_title: Optional[str] = Field(None, min_length=1, max_length=150)
    department: Optional[str] = Field(None, min_length=1, max_length=100)
    years_of_experience: Optional[float] = Field(None, ge=0, le=70)

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_new_password: Optional[str] = None

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if not PASSWORD_REGEX.match(v):
            raise ValueError(
                "New password must contain at least 8 characters, including at least one uppercase letter, "
                "one lowercase letter, one number, and one special character."
            )
        return v

    @model_validator(mode="after")
    def check_passwords_match(self):
        if self.confirm_new_password is not None and self.new_password != self.confirm_new_password:
            raise ValueError("New passwords do not match.")
        return self

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    success: bool = True
    message: str
