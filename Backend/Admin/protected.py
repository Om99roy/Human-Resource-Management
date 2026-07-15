from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schema import UserOut
from dependency import get_current_user, require_admin

router = APIRouter(prefix="/api", tags=["protected"])


@router.get("/me", response_model=UserOut)
def protected_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/admin/users", response_model=list[UserOut])
def admin_list_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return db.query(User).all()


@router.get("/admin/dashboard")
def admin_dashboard(admin: User = Depends(require_admin)):
    return {"message": f"Welcome to the admin dashboard, {admin.email}!"}
 