
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User, RefreshToken, ActionToken, ActionTokenType, UserRole
from schema import (
    RegisterRequest, LoginRequest, TokenPair, RefreshRequest, LogoutRequest,
    VerifyEmailRequest, ForgotPasswordRequest, ResetPasswordRequest,
    UserOut, MessageResponse,
)
from security import hash_password, verify_password, create_access_token, generate_opaque_token
from email_utils import send_verification_email, send_password_reset_email
from dependency import get_current_user
from config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_token_pair(db: Session, user: User) -> TokenPair:
    access_token = create_access_token(user.id, user.role.value)

    refresh_value = generate_opaque_token()
    refresh_record = RefreshToken(
        token=refresh_value,
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(refresh_record)
    db.commit()

    return TokenPair(access_token=access_token, refresh_token=refresh_value)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role=UserRole.USER,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # create + send email verification token
    verify_token = generate_opaque_token()
    db.add(ActionToken(
        token=verify_token,
        user_id=user.id,
        type=ActionTokenType.EMAIL_VERIFY,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
    ))
    db.commit()
    send_verification_email(user.email, verify_token)

    return user


@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    return _issue_token_pair(db, user)


@router.post("/refresh", response_model=TokenPair)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    record = db.query(RefreshToken).filter(RefreshToken.token == payload.refresh_token).first()
    if not record or record.revoked:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    if record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Refresh token expired, please log in again")

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # rotate: revoke old refresh token, issue a new pair
    record.revoked = True
    db.commit()

    return _issue_token_pair(db, user)


@router.post("/logout", response_model=MessageResponse)
def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    record = db.query(RefreshToken).filter(RefreshToken.token == payload.refresh_token).first()
    if record:
        record.revoked = True
        db.commit()
    return MessageResponse(message="Logged out successfully")


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    record = db.query(ActionToken).filter(
        ActionToken.token == payload.token,
        ActionToken.type == ActionTokenType.EMAIL_VERIFY,
    ).first()

    if not record or record.used:
        raise HTTPException(status_code=400, detail="Invalid or already-used verification link")
    if record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Verification link has expired")

    user = db.query(User).filter(User.id == record.user_id).first()
    user.is_verified = True
    record.used = True
    db.commit()

    return MessageResponse(message="Email verified successfully. You can now log in.")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    # Always return the same response, whether or not the email exists,
    # so attackers can't use this endpoint to discover registered emails.
    generic_response = MessageResponse(
        message="If an account with that email exists, a password reset link has been sent."
    )

    if not user:
        return generic_response

    reset_token = generate_opaque_token()
    db.add(ActionToken(
        token=reset_token,
        user_id=user.id,
        type=ActionTokenType.PASSWORD_RESET,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    ))
    db.commit()
    send_password_reset_email(user.email, reset_token)

    return generic_response


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    record = db.query(ActionToken).filter(
        ActionToken.token == payload.token,
        ActionToken.type == ActionTokenType.PASSWORD_RESET,
    ).first()

    if not record or record.used:
        raise HTTPException(status_code=400, detail="Invalid or already-used reset link")
    if record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset link has expired")

    user = db.query(User).filter(User.id == record.user_id).first()
    user.hashed_password = hash_password(payload.new_password)
    record.used = True

    # Invalidate all existing refresh tokens, forcing re-login everywhere.
    db.query(RefreshToken).filter(RefreshToken.user_id == user.id, RefreshToken.revoked == False).update(
        {"revoked": True}
    )
    db.commit()

    return MessageResponse(message="Password reset successfully. You can now log in with your new password.")


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user