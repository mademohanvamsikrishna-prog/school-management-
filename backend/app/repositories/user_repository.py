"""
User and refresh-token repository — all SQLAlchemy queries for auth.

Architecture rule: NO business logic here. Only data access.
"""
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.core.security import hash_refresh_token, refresh_token_expiry


# ---------------------------------------------------------------------------
# User queries
# ---------------------------------------------------------------------------

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Fetch a user (with role + permissions eagerly loaded) by email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Fetch a user by primary key."""
    return db.query(User).filter(User.id == user_id).first()


# ---------------------------------------------------------------------------
# Refresh token queries
# ---------------------------------------------------------------------------

def create_refresh_token_record(
    db: Session,
    user_id: str,
    raw_token: str,
    device_hint: str = "unknown",
) -> RefreshToken:
    """
    Persist a new refresh token (stored as its SHA-256 hash).
    Returns the ORM object (not the raw token — that's the caller's responsibility).
    """
    record = RefreshToken(
        token_hash=hash_refresh_token(raw_token),
        user_id=user_id,
        expires_at=refresh_token_expiry(),
        is_revoked=False,
        device_hint=device_hint,
    )
    db.add(record)
    db.flush()
    return record


def get_refresh_token_record(db: Session, raw_token: str) -> Optional[RefreshToken]:
    """Look up a refresh token row by hashing the provided raw token."""
    token_hash = hash_refresh_token(raw_token)
    return (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash)
        .first()
    )


def revoke_refresh_token(db: Session, raw_token: str) -> bool:
    """
    Revoke (delete) a refresh token by its raw value.
    Returns True if a row was found and deleted, False otherwise.
    """
    record = get_refresh_token_record(db, raw_token)
    if record:
        db.delete(record)
        db.flush()
        return True
    return False


def revoke_all_user_tokens(db: Session, user_id: str) -> int:
    """
    Revoke ALL refresh tokens for a user (e.g., on password change or forced logout).
    Returns the number of tokens revoked.
    """
    count = (
        db.query(RefreshToken)
        .filter(RefreshToken.user_id == user_id)
        .delete(synchronize_session=False)
    )
    db.flush()
    return count


def delete_expired_tokens(db: Session) -> int:
    """Prune expired refresh token rows. Call from a scheduler or admin task."""
    now = datetime.now(timezone.utc)
    count = (
        db.query(RefreshToken)
        .filter(RefreshToken.expires_at < now)
        .delete(synchronize_session=False)
    )
    db.flush()
    return count
