from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class TimetableEntry(Base, TimestampMixin):
    __tablename__ = "timetable_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    class_id: Mapped[str] = mapped_column(String(36), ForeignKey("classes.id", ondelete="CASCADE"), index=True, nullable=False)
    subject_id: Mapped[str] = mapped_column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    teacher_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)  # 1=Monday ... 6=Saturday
    start_time: Mapped[str] = mapped_column(String(10), nullable=False)  # Format: "08:30"
    end_time: Mapped[str] = mapped_column(String(10), nullable=False)  # Format: "09:30"
    room_number: Mapped[str] = mapped_column(String(50), nullable=False)

    classroom = relationship("ClassRoom", foreign_keys=[class_id])
    subject = relationship("Subject", foreign_keys=[subject_id])
    teacher = relationship("User", foreign_keys=[teacher_id])

    __table_args__ = (
        # Prevent teacher from being double booked at the same day & start time
        UniqueConstraint("teacher_id", "day_of_week", "start_time", name="uq_teacher_timetable_slot"),
        # Prevent class from having two lessons at the same time
        UniqueConstraint("class_id", "day_of_week", "start_time", name="uq_class_timetable_slot"),
    )
