from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from backend.app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(String(30), nullable=False)
    gender = Column(String(30), nullable=False)
    phone = Column(String(30), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    organization = Column(String(150), nullable=False)
    job_title = Column(String(150), nullable=False)
    department = Column(String(100), nullable=False)
    years_of_experience = Column(Float, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    terms_accepted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)

    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        """Converts user record to safe dictionary without sensitive credentials."""
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "date_of_birth": self.date_of_birth,
            "gender": self.gender,
            "phone": self.phone,
            "email": self.email,
            "organization": self.organization,
            "job_title": self.job_title,
            "department": self.department,
            "years_of_experience": self.years_of_experience,
            "username": self.username,
            "role": self.role,
            "is_active": self.is_active,
            "terms_accepted_at": self.terms_accepted_at.isoformat() if self.terms_accepted_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None
        }
