from typing import List, Optional
from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class ClassRoom(Base, TimestampMixin):
    __tablename__ = "classes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    grade_level: Mapped[int] = mapped_column(Integer, nullable=False)
    section: Mapped[str] = mapped_column(String(10), nullable=False)
    room_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    capacity: Mapped[int] = mapped_column(Integer, default=40)

    class_teacher_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)

    # Relationships
    class_teacher = relationship("User", foreign_keys=[class_teacher_id])
    enrollments: Mapped[List["StudentEnrollment"]] = relationship("StudentEnrollment", back_populates="classroom")
    class_subjects: Mapped[List["ClassSubject"]] = relationship("ClassSubject", back_populates="classroom")


class Subject(Base, TimestampMixin):
    __tablename__ = "subjects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    class_subjects: Mapped[List["ClassSubject"]] = relationship("ClassSubject", back_populates="subject")


class ClassSubject(Base, TimestampMixin):
    __tablename__ = "class_subjects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    class_id: Mapped[str] = mapped_column(String(36), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    subject_id: Mapped[str] = mapped_column(String(36), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    teacher_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)

    classroom: Mapped[ClassRoom] = relationship("ClassRoom", back_populates="class_subjects")
    subject: Mapped[Subject] = relationship("Subject", back_populates="class_subjects")
    teacher = relationship("User", foreign_keys=[teacher_id])

    __table_args__ = (
        UniqueConstraint("class_id", "subject_id", name="uq_class_subject"),
    )


class StudentEnrollment(Base, TimestampMixin):
    __tablename__ = "student_enrollments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    class_id: Mapped[str] = mapped_column(String(36), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    academic_year: Mapped[str] = mapped_column(String(20), default="2026-2027", nullable=False)
    roll_number: Mapped[str] = mapped_column(String(50), nullable=False)

    student = relationship("User", foreign_keys=[student_id])
    classroom: Mapped[ClassRoom] = relationship("ClassRoom", back_populates="enrollments")

    __table_args__ = (
        UniqueConstraint("student_id", "academic_year", name="uq_student_academic_year"),
    )
