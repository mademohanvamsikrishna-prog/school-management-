from typing import List, Optional
from sqlalchemy import Float, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class Exam(Base, TimestampMixin):
    __tablename__ = "exams"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    term: Mapped[str] = mapped_column(String(50), nullable=False)
    academic_year: Mapped[str] = mapped_column(String(20), default="2026-2027", nullable=False)
    start_date: Mapped[str] = mapped_column(String(10), nullable=False)
    end_date: Mapped[str] = mapped_column(String(10), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="upcoming")  # upcoming, ongoing, completed

    exam_subjects: Mapped[List["ExamSubject"]] = relationship("ExamSubject", back_populates="exam", cascade="all, delete-orphan")


class ExamSubject(Base, TimestampMixin):
    __tablename__ = "exam_subjects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    exam_id: Mapped[str] = mapped_column(String(36), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    class_id: Mapped[str] = mapped_column(String(36), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    subject_id: Mapped[str] = mapped_column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)

    max_marks: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    passing_marks: Mapped[float] = mapped_column(Float, default=35.0, nullable=False)
    exam_date: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)

    exam: Mapped[Exam] = relationship("Exam", back_populates="exam_subjects")
    classroom = relationship("ClassRoom", foreign_keys=[class_id])
    subject = relationship("Subject", foreign_keys=[subject_id])
    marks: Mapped[List["MarkRecord"]] = relationship("MarkRecord", back_populates="exam_subject", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("exam_id", "class_id", "subject_id", name="uq_exam_class_subject"),
    )


class MarkRecord(Base, TimestampMixin):
    __tablename__ = "mark_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    exam_subject_id: Mapped[str] = mapped_column(String(36), ForeignKey("exam_subjects.id", ondelete="CASCADE"), nullable=False)
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    marks_obtained: Mapped[float] = mapped_column(Float, nullable=False)
    grade: Mapped[str] = mapped_column(String(10), nullable=False)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    entered_by_teacher_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)

    exam_subject: Mapped[ExamSubject] = relationship("ExamSubject", back_populates="marks")
    student = relationship("User", foreign_keys=[student_id])
    entered_by = relationship("User", foreign_keys=[entered_by_teacher_id])

    __table_args__ = (
        UniqueConstraint("exam_subject_id", "student_id", name="uq_student_exam_subject_mark"),
    )
