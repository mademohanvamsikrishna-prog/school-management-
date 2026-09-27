"""
Tests for CORS configuration and unhandled exception CORS handling.
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app, raise_server_exceptions=False)
TARGET_ORIGIN = "https://school-management-axyqm7yms-mademohanvamsikrishna-8090.vercel.app"


def test_cors_preflight_target_origin():
    """OPTIONS preflight for target origin returns 200 with credentials and mirrored headers."""
    response = client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": TARGET_ORIGIN,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type,Authorization,X-Custom-Header",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == TARGET_ORIGIN
    assert response.headers.get("access-control-allow-credentials") == "true"
    assert "POST" in response.headers.get("access-control-allow-methods", "")
    assert "content-type" in response.headers.get("access-control-allow-headers", "").lower()


def test_cors_post_login_target_origin():
    """POST /api/v1/auth/login includes CORS headers even on auth failure (401)."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@school.edu", "password": "wrongpassword"},
        headers={"Origin": TARGET_ORIGIN},
    )
    assert response.status_code == 401
    assert response.headers.get("access-control-allow-origin") == TARGET_ORIGIN
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_local_dev_origins():
    """Localhost dev origins are permitted."""
    for origin in ["http://localhost:3000", "http://localhost:5173"]:
        response = client.options(
            "/api/v1/auth/login",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            },
        )
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == origin
        assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_dynamic_vercel_preview():
    """Any preview branch deployment on vercel.app is allowed via allow_origin_regex."""
    preview_origin = "https://school-management-pr-12345-preview.vercel.app"
    response = client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": preview_origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == preview_origin
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_disallowed_origin():
    """Unapproved external origin is rejected during preflight."""
    response = client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": "https://unauthorized-domain.com",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.headers.get("access-control-allow-origin") is None
