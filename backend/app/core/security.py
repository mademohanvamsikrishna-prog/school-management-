"""
security.py — password hashing and JWT token utilities.

- Passwords are hashed with bcrypt (72-byte limit respected).
- Access tokens are short-lived JWTs (HS256, configurable TTL).
- Refresh tokens are opaque random strings stored hashed in the DB.
  The raw token is returned once to the client and never logged.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import hashlib
import secrets
import bcrypt
import jwt
from app.core.config import settings


# ---------------------------------------------------------------------------
# Password
# ---------------------------------------------------------------------------

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Returns True if plain_password matches the bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash a password with bcrypt. Truncates to 72 bytes (bcrypt limit)."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


# ---------------------------------------------------------------------------
# Access token (JWT)
# ---------------------------------------------------------------------------

def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Create a signed JWT access token.

    Args:
        subject: Usually the user's UUID (stored as `sub`).
        expires_delta: Override the default TTL from settings.
        extra_claims: Additional claims merged into the payload.
    """
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    payload: Dict[str, Any] = {
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "sub": str(subject),
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify a JWT. Raises ValueError on any failure
    (expired, bad signature, malformed).
    """
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired.")
    except jwt.PyJWTError as exc:
        raise ValueError(f"Invalid token: {exc}")


# ---------------------------------------------------------------------------
# Refresh token (opaque, stored hashed in DB)
# ---------------------------------------------------------------------------

REFRESH_TOKEN_BYTES = 32  # 256-bit entropy → 64-char hex string


def generate_refresh_token() -> str:
    """
    Generate a cryptographically secure random refresh token.
    Returns the RAW token — store only the hash in the DB.
    """
    return secrets.token_hex(REFRESH_TOKEN_BYTES)


def hash_refresh_token(raw_token: str) -> str:
    """SHA-256 hash of the raw refresh token for DB storage."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def refresh_token_expiry() -> datetime:
    """Calculate the absolute expiry datetime for a new refresh token."""
    return datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
