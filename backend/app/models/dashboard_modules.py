"""
Student Dashboard CRUD Models:
- StudentAssignment: Coursework, homework, and assignment tracker
- Notice: Announcements, notices, and circulars
- StudentLeave: Leave applications and status tracking
"""
from typing import Optional
from sqlalchemy import Boolean, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class StudentAssignment(Base, TimestampMixin):
    __tablename__ = "student_assignments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    class_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("classes.id", ondelete="SET NULL"), nullable=True)
    subject_name: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    due_date: Mapped[str] = mapped_column(String(10), index=True, nullable=False)  # YYYY-MM-DD
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True, nullable=False)  # pending, in_progress, completed, submitted, overdue
    priority: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)  # low, medium, high, urgent
    submission_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    attachment_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    max_score: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)

    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    classroom = relationship("ClassRoom", foreign_keys=[class_id])


class Notice(Base, TimestampMixin):
    __tablename__ = "notices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="academic", index=True, nullable=False)  # academic, exam, event, sports, general
    priority: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)  # low, medium, high, urgent
    target_role: Mapped[str] = mapped_column(String(50), default="all", nullable=False)  # all, student, teacher, parent
    class_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("classes.id", ondelete="SET NULL"), nullable=True)
    posted_by_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_acknowledged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    date: Mapped[str] = mapped_column(String(10), index=True, nullable=False)  # YYYY-MM-DD

    # Relationships
    posted_by = relationship("User", foreign_keys=[posted_by_id])
    classroom = relationship("ClassRoom", foreign_keys=[class_id])


class StudentLeave(Base, TimestampMixin):
    __tablename__ = "student_leaves"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    leave_type: Mapped[str] = mapped_column(String(50), default="Medical", nullable=False)  # Medical, Casual, Family Emergency, Study Leave
    start_date: Mapped[str] = mapped_column(String(10), index=True, nullable=False)  # YYYY-MM-DD
    end_date: Mapped[str] = mapped_column(String(10), index=True, nullable=False)    # YYYY-MM-DD
    days_count: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True, nullable=False)  # pending, approved, rejected, cancelled
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    student = relationship("User", foreign_keys=[student_id])
