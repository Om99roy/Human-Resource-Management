import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from config import settings


def send_email(to_email: str, subject: str, html_body: str, text_body: str = ""):
    """
    Sends an email via SMTP if credentials are configured in .env.
    Otherwise (dev mode), just prints the email to the console so you
    can copy the link out and test the flow without any setup.
    """
    if not settings.EMAIL_ENABLED:
        #print("\n" + "=" * 70)
        print("DEV MODE: Email not sent (no SMTP configured). Contents below:")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(text_body or html_body)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email

    if text_body:
        msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())


def send_verification_email(to_email: str, token: str):
    link = f"{settings.FRONTEND_URL}/verify-email.html?token={token}"
    send_email(
        to_email,
        "Verify your email address",
        html_body=f'<p>Welcome! Please verify your email by clicking <a href="{link}">this link</a>.</p>'
                   f"<p>This link expires in 24 hours.</p>",
        text_body=f"Welcome! Verify your email by visiting this link (expires in 24 hours):\n{link}",
    )


def send_password_reset_email(to_email: str, token: str):
    link = f"{settings.FRONTEND_URL}/reset-password.html?token={token}"
    send_email(
        to_email,
        "Reset your password",
        html_body=f'<p>We received a request to reset your password. Click <a href="{link}">here</a> to choose a new one.</p>'
                   f"<p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>",
        text_body=f"Reset your password (expires in 1 hour):\n{link}\n\nIf you didn't request this, ignore this email.",
    )