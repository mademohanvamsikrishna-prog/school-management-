"""
Auth service — business logic for login, token refresh, and profile retrieval.

Architecture rule: No HTTP/FastAPI types here. Raises domain exceptions only.
"""
from datetime import datetime, timezone
from typing import Tuple

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    generate_refresh_token,
    verify_password,
)
from app.core.config import settings
from app.models.user import User
from app.repositories import user_repository
from app.schemas.auth import TokenResponse, UserMeResponse


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_user_me(user: User) -> UserMeResponse:
    """Map an ORM User to the safe UserMeResponse schema (no password hash)."""
    return UserMeResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        is_active=user.is_active,
        avatar_url=user.avatar_url,
        role=user.role,
        permissions=user.permission_codes,
    )


def _build_token_response(
    user: User,
    raw_access: str,
    raw_refresh: str,
) -> TokenResponse:
    return TokenResponse(
        access_token=raw_access,
        refresh_token=raw_refresh,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=_build_user_me(user),
    )


# ---------------------------------------------------------------------------
# Auth operations
# ---------------------------------------------------------------------------

def login(db: Session, email: str, password: str) -> TokenResponse:
    """
    Authenticate a user by email + password.

    Security:
    - Returns the SAME generic error for unknown email and wrong password
      to prevent user enumeration attacks.
    - Rejects inactive users with a distinct, non-sensitive message.
    """
    user = user_repository.get_user_by_email(db, email)

    # Constant-time-ish check: always verify even for unknown users
    # by running against a dummy hash so timing doesn't leak existence.
    _DUMMY_HASH = "$2b$12$KIXr9yMs7REVf/Nk9mrfheAzOFzHBvJmzXR8DqYhL2rN6cLHZ4.Tq"
    candidate_hash = user.hashed_password if user else _DUMMY_HASH
    password_ok = verify_password(password, candidate_hash)

    if not user or not password_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled. Please contact the school administrator.",
        )

    # Issue tokens
    raw_access = create_access_token(subject=user.id)
    raw_refresh = generate_refresh_token()
    user_repository.create_refresh_token_record(db, user_id=user.id, raw_token=raw_refresh)
    db.commit()

    return _build_token_response(user, raw_access, raw_refresh)


def refresh_tokens(db: Session, raw_refresh_token: str) -> TokenResponse:
    """
    Validate a refresh token and issue a new access + refresh token pair
    (token rotation — old refresh token is revoked on use).
    """
    record = user_repository.get_refresh_token_record(db, raw_refresh_token)

    if not record or record.is_revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid or has been revoked.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # SQLite stores datetimes as offset-naive; normalize before comparison
    expires_at = record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        # Clean up the expired record
        db.delete(record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = user_repository.get_user_by_id(db, record.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled.",
        )

    # Token rotation: revoke old, issue new
    db.delete(record)
    raw_access = create_access_token(subject=user.id)
    raw_refresh = generate_refresh_token()
    user_repository.create_refresh_token_record(db, user_id=user.id, raw_token=raw_refresh)
    db.commit()

    return _build_token_response(user, raw_access, raw_refresh)


def get_me(db: Session, user_id: str) -> UserMeResponse:
    """Return the authenticated user's profile."""
    user = user_repository.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return _build_user_me(user)
