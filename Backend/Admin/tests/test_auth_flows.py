import pytest
from fastapi.testclient import TestClient

from main import app
from database import SessionLocal
import models


@pytest.fixture(scope="function")
def client():
    return TestClient(app)


def get_latest_action_token(db, user_id, token_type):
    return db.query(models.ActionToken).filter(models.ActionToken.user_id == user_id,
                                               models.ActionToken.type == token_type).order_by(models.ActionToken.created_at.desc()).first()


def test_verify_and_reset_flow(client):
    import uuid
    db = SessionLocal()
    email = f"pytest_user_{uuid.uuid4().hex[:8]}@example.com"
    password = "Testpass1"

    # register
    r = client.post("/auth/register", json={"email": email, "full_name": "PyTest", "password": password})
    assert r.status_code == 201
    user = r.json()
    user_id = user["id"]

    # fetch verification token from DB
    token_rec = get_latest_action_token(db, user_id, models.ActionTokenType.EMAIL_VERIFY)
    assert token_rec is not None

    # verify email
    r = client.post("/auth/verify-email", json={"token": token_rec.token})
    assert r.status_code == 200

    # login
    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200
    data = r.json()
    access = data.get("access_token")
    refresh = data.get("refresh_token")

    # refresh token
    r = client.post("/auth/refresh", json={"refresh_token": refresh})
    assert r.status_code == 200
    new_tokens = r.json()
    assert new_tokens.get("access_token") and new_tokens.get("refresh_token")

    # logout using the new refresh token
    r = client.post("/auth/logout", json={"refresh_token": new_tokens.get("refresh_token")})
    assert r.status_code == 200

    # after logout, refresh should be invalid
    r = client.post("/auth/refresh", json={"refresh_token": new_tokens.get("refresh_token")})
    assert r.status_code == 401

    # forgot password -> get reset token -> reset -> login with new password
    r = client.post("/auth/forgot-password", json={"email": email})
    assert r.status_code == 200

    reset_rec = get_latest_action_token(db, user_id, models.ActionTokenType.PASSWORD_RESET)
    assert reset_rec is not None

    r = client.post("/auth/reset-password", json={"token": reset_rec.token, "new_password": "Newpass1"})
    assert r.status_code == 200

    r = client.post("/auth/login", json={"email": email, "password": "Newpass1"})
    assert r.status_code == 200

    db.close()
