"""HR + Performance models: departments and staff performance records."""
from typing import List, Optional
from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class Department(Base, TimestampMixin):
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    head_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)

    head = relationship("User", foreign_keys=[head_id])


class StaffPerformanceRecord(Base, TimestampMixin):
    __tablename__ = "staff_performance_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    staff_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    reviewer_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    review_period: Mapped[str] = mapped_column(String(30), nullable=False)  # e.g. "2026-Q3"
    teaching_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 0-10
    punctuality_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    communication_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    overall_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    comments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft")  # draft, submitted, reviewed

    staff = relationship("User", foreign_keys=[staff_id])
    reviewer = relationship("User", foreign_keys=[reviewer_id])
