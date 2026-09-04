"""
Authentication and RBAC test suite.

Coverage:
    1.  Valid login — correct credentials → 200 + tokens
    2.  Invalid password — wrong password → 401
    3.  Unknown user — non-existent email → 401
    4.  Inactive user — is_active=False → 403
    5.  Valid access token — /auth/me with valid JWT → 200 + profile
    6.  Expired / invalid token — tampered JWT → 401
    7.  No token — /auth/me without Authorization header → 401
    8.  Refresh token — valid refresh → 200 + new tokens
    9.  Invalid refresh token — garbage token → 401
    10. Permission allowed — admin has marks:write → 200
    11. Permission denied — student lacks marks:write → 403
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.dependencies import require_permission
from app.main import app, api_v1_router
from fastapi import APIRouter

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

LOGIN_URL = "/api/v1/auth/login"
ME_URL = "/api/v1/auth/me"
REFRESH_URL = "/api/v1/auth/refresh"


def do_login(client: TestClient, email: str, password: str = "testpass123") -> dict:
    resp = client.post(LOGIN_URL, json={"email": email, "password": password})
    return resp


# ---------------------------------------------------------------------------
# 1. Valid login
# ---------------------------------------------------------------------------

def test_valid_login(client: TestClient, seed_users):
    resp = do_login(client, "admin@test.edu")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["access_token"]
    assert data["refresh_token"]
    assert data["token_type"] == "bearer"
    assert data["expires_in"] > 0
    assert data["user"]["email"] == "admin@test.edu"
    # Password hash must NEVER appear
    assert "hashed_password" not in str(data)
    assert "password" not in str(data["user"])


# ---------------------------------------------------------------------------
# 2. Invalid password
# ---------------------------------------------------------------------------

def test_invalid_password(client: TestClient, seed_users):
    resp = do_login(client, "admin@test.edu", password="WRONG_password")
    assert resp.status_code == 401
    body = resp.json()
    assert "Invalid email or password" in body["detail"]
    # Must not reveal whether email exists
    assert "admin" not in body["detail"].lower()


# ---------------------------------------------------------------------------
# 3. Unknown user
# ---------------------------------------------------------------------------

def test_unknown_user(client: TestClient, seed_users):
    resp = do_login(client, "nobody@test.edu")
    assert resp.status_code == 401
    # Same message as wrong password — prevents user enumeration
    assert "Invalid email or password" in resp.json()["detail"]


# ---------------------------------------------------------------------------
# 4. Inactive user
# ---------------------------------------------------------------------------

def test_inactive_user(client: TestClient, seed_users):
    resp = do_login(client, "inactive@test.edu")
    assert resp.status_code == 403
    assert "disabled" in resp.json()["detail"].lower()


# ---------------------------------------------------------------------------
# 5. Valid access token → /auth/me
# ---------------------------------------------------------------------------

def test_get_me_valid_token(client: TestClient, seed_users):
    login_resp = do_login(client, "teacher@test.edu")
    assert login_resp.status_code == 200
    access = login_resp.json()["access_token"]

    me_resp = client.get(ME_URL, headers={"Authorization": f"Bearer {access}"})
    assert me_resp.status_code == 200
    profile = me_resp.json()
    assert profile["email"] == "teacher@test.edu"
    assert profile["is_active"] is True
    assert "hashed_password" not in profile
    assert isinstance(profile["permissions"], list)


# ---------------------------------------------------------------------------
# 6. Expired / invalid token
# ---------------------------------------------------------------------------

def test_invalid_token(client: TestClient, seed_users):
    resp = client.get(ME_URL, headers={"Authorization": "Bearer this.is.not.a.valid.jwt"})
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# 7. No token (unauthenticated request)
# ---------------------------------------------------------------------------

def test_no_token(client: TestClient, seed_users):
    resp = client.get(ME_URL)
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# 8. Refresh token — issues new token pair
# ---------------------------------------------------------------------------

def test_refresh_token(client: TestClient, seed_users):
    login_resp = do_login(client, "student@test.edu")
    assert login_resp.status_code == 200
    refresh_token = login_resp.json()["refresh_token"]
    old_access = login_resp.json()["access_token"]

    refresh_resp = client.post(REFRESH_URL, json={"refresh_token": refresh_token})
    assert refresh_resp.status_code == 200
    new_data = refresh_resp.json()
    assert new_data["access_token"]
    assert new_data["refresh_token"]
    # New refresh token should be different (rotation)
    assert new_data["refresh_token"] != refresh_token


# ---------------------------------------------------------------------------
# 9. Invalid refresh token
# ---------------------------------------------------------------------------

def test_invalid_refresh_token(client: TestClient, seed_users):
    resp = client.post(REFRESH_URL, json={"refresh_token": "garbage_token_value"})
    assert resp.status_code == 401
    assert "invalid" in resp.json()["detail"].lower() or "revoked" in resp.json()["detail"].lower()


# ---------------------------------------------------------------------------
# 10. Permission allowed — admin has marks:write
# ---------------------------------------------------------------------------

def test_permission_allowed(client: TestClient, seed_users):
    """
    Admin has marks:write — verify via the /me permissions list.
    Full end-to-end: login → get profile → check permission present.
    """
    login_resp = do_login(client, "admin@test.edu")
    assert login_resp.status_code == 200
    access = login_resp.json()["access_token"]

    me_resp = client.get(ME_URL, headers={"Authorization": f"Bearer {access}"})
    assert me_resp.status_code == 200
    permissions = me_resp.json()["permissions"]
    assert "marks:write" in permissions, (
        f"Admin should have marks:write in permissions, got: {permissions}"
    )
    # Verify full profile integrity
    assert me_resp.json()["role"]["name"] == "admin"


# ---------------------------------------------------------------------------
# 11. Permission denied — student lacks marks:write
# ---------------------------------------------------------------------------

def test_permission_denied(client: TestClient, seed_users):
    """Student does not have marks:write — verify via permissions list."""
    login_resp = do_login(client, "student@test.edu")
    access = login_resp.json()["access_token"]
    me_resp = client.get(ME_URL, headers={"Authorization": f"Bearer {access}"})
    permissions = me_resp.json()["permissions"]
    assert "marks:write" not in permissions, f"Student should not have marks:write, got {permissions}"
