"""
Send a test verification email using configured SMTP in .env.
Usage:
  python scripts/send_test_email.py recipient@example.com

This script uses the same `send_email` function as the app, so set
SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD and EMAIL_FROM in your
.env to enable real sending (e.g., Mailtrap or your SMTP provider).
"""
import sys
import os
import pathlib
import secrets

# ensure the project root is on sys.path when run from scripts/ subdirectory
ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from config import settings
from email_utils import send_verification_email, send_email


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/send_test_email.py recipient@example.com")
        sys.exit(1)
    to_email = sys.argv[1]
    # generate a short-lived demo token
    token = secrets.token_urlsafe(24)
    if settings.EMAIL_ENABLED:
        print(f"Sending verification email to {to_email} via {settings.SMTP_HOST}:{settings.SMTP_PORT}...")
        send_verification_email(to_email, token)
        print("Sent (check your inbox).")
    else:
        print("EMAIL not enabled in settings. Printing the verification link below:")
        link = f"{settings.FRONTEND_URL}/verify-email.html?token={token}"
        print(link)


if __name__ == '__main__':
    main()
