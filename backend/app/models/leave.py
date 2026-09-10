"""Leave management models: leave types, requests, staff timesheets."""
from typing import Optional
from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class LeaveType(Base, TimestampMixin):
    __tablename__ = "leave_types"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    max_days_per_year: Mapped[int] = mapped_column(Integer, default=12)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=True)

    requests = relationship("LeaveRequest", back_populates="leave_type")


class LeaveRequest(Base, TimestampMixin):
    __tablename__ = "leave_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    leave_type_id: Mapped[str] = mapped_column(String(36), ForeignKey("leave_types.id", ondelete="RESTRICT"), nullable=False)
    start_date: Mapped[str] = mapped_column(String(10), nullable=False)  # YYYY-MM-DD
    end_date: Mapped[str] = mapped_column(String(10), nullable=False)    # YYYY-MM-DD
    days_count: Mapped[float] = mapped_column(Float, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    # pending, approved, rejected, cancelled

    approved_by_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user = relationship("User", foreign_keys=[user_id])
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    leave_type: Mapped[LeaveType] = relationship("LeaveType", back_populates="requests")


class StaffTimesheet(Base, TimestampMixin):
    __tablename__ = "staff_timesheets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    date: Mapped[str] = mapped_column(String(10), nullable=False)  # YYYY-MM-DD
    check_in: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)   # "09:00"
    check_out: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # "17:00"
    status: Mapped[str] = mapped_column(String(20), default="present")
    # present, absent, half_day, on_leave, holiday

    user = relationship("User", foreign_keys=[user_id])
