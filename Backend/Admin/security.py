import secrets
from datetime import datetime, timezone, timedelta

from jose import jwt, JWTError
from passlib.context import CryptContext

from config import settings
 
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
 
 # Password hashing 
 
def hash_password(password: str) -> str:
    return pwd_context.hash(password)
 
 
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
 
 
# ---------- JWT access tokens ----------
 
def create_access_token(user_id: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "role": role, "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
 
 
def decode_access_token(token: str) -> dict:
    print(f"[security.decode_access_token] token(len={len(token)})")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        print(f"[security.decode_access_token] payload={payload}")
        if payload.get("type") != "access":
            print("[security.decode_access_token] wrong type")
            return None
        return payload
    except JWTError as e:
        print(f"[security.decode_access_token] JWTError: {e}")
        return None
 
 
# ---------- Opaque random tokens (refresh / email-verify / reset) ----------
# These are stored hashed-free as random strings in the DB (not JWTs), so they
# can be looked up, checked for expiry/reuse, and revoked individually.
 
def generate_opaque_token() -> str:
    return secrets.token_urlsafe(32)
 