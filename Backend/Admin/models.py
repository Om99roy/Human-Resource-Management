import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

def gen_uuid():
    return str(uuid.uuid4())

def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
 
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
 
    created_at = Column(DateTime, default=utcnow)
 
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    action_tokens = relationship("ActionToken", back_populates="user", cascade="all, delete-orphan")
 
 
class RefreshToken(Base):
    """Stored so logout / revocation actually works (JWTs alone can't be revoked)."""
    __tablename__ = "refresh_tokens"
 
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
 
    user = relationship("User", back_populates="refresh_tokens")
 
 
class ActionTokenType(str, enum.Enum):
    EMAIL_VERIFY = "email_verify"
    PASSWORD_RESET = "password_reset"
 
 
class ActionToken(Base):
    """One-time tokens for email verification and password reset links."""
    __tablename__ = "action_tokens"
 
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(ActionTokenType), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
 
    user = relationship("User", back_populates="action_tokens")