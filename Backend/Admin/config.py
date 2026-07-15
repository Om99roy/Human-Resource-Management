import os
import secrets
from dotenv import load_dotenv

# load .env file if present
load_dotenv()



class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY") or secrets.token_hex(32)
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # default to a local sqlite file for quick testing, allow override with DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")

    # When the frontend is served from the same FastAPI app, use backend port 8001.
    # If you instead host the frontend separately on port 5500, override this in .env.
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:8001")

    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@example.com")

    EMAIL_ENABLED: bool = bool(SMTP_HOST and SMTP_USERNAME and SMTP_PASSWORD)

    FIRST_ADMIN_EMAIL: str = os.getenv("FIRST_ADMIN_EMAIL", "admin@example.com")
    FIRST_ADMIN_PASSWORD: str = os.getenv("FIRST_ADMIN_PASSWORD", "ChangeMe123!")


settings = Settings()

if settings.SECRET_KEY == "change-this-to-a-long-random-secret-string":
    print("WARNING: You are using the default SECRET_KEY. Set a real one in .env before deploying.")