from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base, SessionLocal
import models
from auth import router as auth_router
from protected import router as protected_router
from config import settings
from security import hash_password
from models import User, UserRole


# create db tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# allow the frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(protected_router)
app.mount("/", StaticFiles(directory=".", html=True), name="static")


@app.on_event("startup")
def startup_admin():
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if not existing_admin:
            admin = User(
                email=settings.FIRST_ADMIN_EMAIL,
                full_name="Admin",
                hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
                role=UserRole.ADMIN,
                is_verified=True,
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"status": "ok", "message": "Auth API is running. See /docs for interactive API docs."}