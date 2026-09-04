from typing import Optional
from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class AttendanceRecord(Base, TimestampMixin):
    __tablename__ = "attendance_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    class_id: Mapped[str] = mapped_column(String(36), ForeignKey("classes.id", ondelete="CASCADE"), index=True, nullable=False)
    date: Mapped[str] = mapped_column(String(10), index=True, nullable=False)  # Format: YYYY-MM-DD
    status: Mapped[str] = mapped_column(String(20), default="present", nullable=False)  # present, absent, late, half_day
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recorded_by_teacher_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)

    student = relationship("User", foreign_keys=[student_id])
    classroom = relationship("ClassRoom", foreign_keys=[class_id])
    recorded_by = relationship("User", foreign_keys=[recorded_by_teacher_id])

    __table_args__ = (
        UniqueConstraint("student_id", "date", name="uq_student_daily_attendance"),
    )
