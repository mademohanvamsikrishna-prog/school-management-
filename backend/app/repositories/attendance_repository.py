"""Attendance data access — no business logic."""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.attendance import AttendanceRecord


def get_summary_for_student(db: Session, student_id: str) -> dict:
    rows = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == student_id).all()
    total = len(rows)
    present = sum(1 for r in rows if r.status == "present")
    absent = sum(1 for r in rows if r.status == "absent")
    late = sum(1 for r in rows if r.status == "late")
    pct = round((present / total * 100), 1) if total else 0.0
    return {
        "student_id": student_id,
        "total_days": total,
        "present_days": present,
        "absent_days": absent,
        "late_days": late,
        "percentage": pct,
    }


def get_records_for_student(
    db: Session,
    student_id: str,
    limit: int = 30,
    offset: int = 0,
) -> List[AttendanceRecord]:
    return (
        db.query(AttendanceRecord)
        .filter(AttendanceRecord.student_id == student_id)
        .order_by(AttendanceRecord.date.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def get_records_for_class_on_date(
    db: Session, class_id: str, date: str
) -> List[AttendanceRecord]:
    return (
        db.query(AttendanceRecord)
        .filter(
            AttendanceRecord.class_id == class_id,
            AttendanceRecord.date == date,
        )
        .all()
    )


def upsert_attendance(
    db: Session,
    *,
    student_id: str,
    class_id: str,
    date: str,
    status: str,
    remarks: Optional[str],
    teacher_id: Optional[str],
) -> AttendanceRecord:
    """Insert or update a single attendance record (idempotent)."""
    existing = (
        db.query(AttendanceRecord)
        .filter(
            AttendanceRecord.student_id == student_id,
            AttendanceRecord.date == date,
        )
        .first()
    )
    if existing:
        existing.status = status
        existing.remarks = remarks
        existing.recorded_by_teacher_id = teacher_id
        db.flush()
        return existing

    record = AttendanceRecord(
        student_id=student_id,
        class_id=class_id,
        date=date,
        status=status,
        remarks=remarks,
        recorded_by_teacher_id=teacher_id,
    )
    db.add(record)
    db.flush()
    return record
