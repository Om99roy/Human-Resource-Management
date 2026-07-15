from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
from models import User, UserRole
from security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)) -> User:
    
    # token validation for credentials

    credentials_exception = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail = "Could not validate your credentials",
        headers = {"WWW-Authenticate": "Bearer"},
    )

    print(f"[dependency.get_current_user] token={token}")
    if not token:
        raise credentials_exception
    
    # decode the token and get the payload
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    # get the user
    user_id = payload.get('sub')
    try:
        user_id = int(user_id)
    except Exception:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    
    # check if the user exists or is active
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account Disabled for inactive user"
        )
    return user

# get the current user(active)

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please kindly very your email first!!"
        )
    return current_user

def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
 
