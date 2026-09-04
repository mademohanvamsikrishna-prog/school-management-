"""
RefreshToken model — stores server-side refresh tokens for revocation support.

Design decisions:
- Tokens are stored hashed (SHA-256) so a DB breach does not expose raw tokens.
- Each user can have multiple active tokens (multi-device support).
- Tokens carry an expiry; expired rows can be pruned on a schedule.
- Revoking a token simply deletes the row — instant session invalidation.
"""
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class RefreshToken(Base, TimestampMixin):
    __tablename__ = "refresh_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)

    # Store a SHA-256 hash of the token, not the raw value
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )

    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Optional: tag which device/client this token belongs to
    device_hint: Mapped[str] = mapped_column(String(100), default="unknown", nullable=False)

    user = relationship("User", foreign_keys=[user_id])
