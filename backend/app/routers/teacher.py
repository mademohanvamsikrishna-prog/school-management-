"""
Teacher-specific REST API endpoints.
Mounted under /api/v1 in main.py.

Endpoints:
  GET  /teacher/me/classes              — classes where I am the class teacher
  GET  /teacher/me/timetable            — my full timetable (filterable by day)
  GET  /teacher/me/attendance/stats     — per-class present/total counts
  GET  /teacher/me/students             — all students across my classes
  GET  /teacher/me/subjects             — subjects I teach (via class_subjects)
  PATCH /teacher/me/profile             — update teacher profile fields
"""
from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.dependencies import get_current_user, require_permission
from app.db.session import get_db
from app.models.user import User
from app.models.academic import ClassRoom, ClassSubject, StudentEnrollment, Subject
from app.models.timetable import TimetableEntry
from app.models.attendance import AttendanceRecord
from app.models.marks import MarkRecord, ExamSubject

router = APIRouter(prefix="/teacher", tags=["Teacher"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class TeacherClassOut(BaseModel):
    id: str
    name: str
    grade_level: int
    section: str
    room_number: Optional[str] = None
    capacity: int
    student_count: int
    is_class_teacher: bool

class TimetableSlotOut(BaseModel):
    id: str
    class_id: str
    class_name: str
    subject_id: str
    subject_name: str
    day_of_week: int
    start_time: str
    end_time: str
    room_number: Optional[str] = None

class AttendanceStatOut(BaseModel):
    class_id: str
    class_name: str
    total_records: int
    present_count: int
    attendance_rate: float

class StudentSummaryOut(BaseModel):
    id: str
    name: str
    email: str
    class_id: str
    class_name: str
    roll_number: str

class SubjectOut(BaseModel):
    id: str
    name: str
    code: str
    department: Optional[str] = None
    class_count: int

class TeacherProfileUpdateIn(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None


# ---------------------------------------------------------------------------
# Helper: get all classes where teacher is involved
# ---------------------------------------------------------------------------

def _get_teacher_class_ids(db: Session, teacher_id: str) -> List[str]:
    """Returns class IDs where teacher is class_teacher OR teaches a subject."""
    # Classes where assigned as class teacher
    ct_ids = {
        r[0] for r in db.query(ClassRoom.id)
        .filter(ClassRoom.class_teacher_id == teacher_id)
        .all()
    }
    # Classes where teaches any subject
    cs_ids = {
        r[0] for r in db.query(ClassSubject.class_id)
        .filter(ClassSubject.teacher_id == teacher_id)
        .all()
    }
    return list(ct_ids | cs_ids)


# ---------------------------------------------------------------------------
# GET /teacher/me/classes
# ---------------------------------------------------------------------------

@router.get("/me/classes", response_model=List[TeacherClassOut], summary="My classes")
def get_my_classes(
    current_user: User = Depends(require_permission("timetable:read")),
    db: Session = Depends(get_db),
) -> List[TeacherClassOut]:
    """All classes this teacher is involved with (class teacher or subject teacher)."""
    class_ids = _get_teacher_class_ids(db, current_user.id)
    if not class_ids:
        return []

    classes = db.query(ClassRoom).filter(ClassRoom.id.in_(class_ids)).all()
    result = []
    for cls in classes:
        student_count = (
            db.query(StudentEnrollment)
            .filter(StudentEnrollment.class_id == cls.id)
            .count()
        )
        result.append(TeacherClassOut(
            id=cls.id,
            name=cls.name,
            grade_level=cls.grade_level,
            section=cls.section,
            room_number=cls.room_number,
            capacity=cls.capacity,
            student_count=student_count,
            is_class_teacher=(cls.class_teacher_id == current_user.id),
        ))
    return result


# ---------------------------------------------------------------------------
# GET /teacher/me/timetable
# ---------------------------------------------------------------------------

@router.get("/me/timetable", response_model=List[TimetableSlotOut], summary="My timetable")
def get_my_timetable(
    day: Optional[int] = Query(None, ge=1, le=7, description="ISO weekday: 1=Mon … 7=Sun"),
    current_user: User = Depends(require_permission("timetable:read")),
    db: Session = Depends(get_db),
) -> List[TimetableSlotOut]:
    """Full timetable for this teacher, optionally filtered to a single day."""
    q = db.query(TimetableEntry).filter(TimetableEntry.teacher_id == current_user.id)
    if day is not None:
        q = q.filter(TimetableEntry.day_of_week == day)
    entries = q.order_by(TimetableEntry.day_of_week, TimetableEntry.start_time).all()

    result = []
    for e in entries:
        cls = db.query(ClassRoom).filter(ClassRoom.id == e.class_id).first()
        subj = db.query(Subject).filter(Subject.id == e.subject_id).first()
        result.append(TimetableSlotOut(
            id=e.id,
            class_id=e.class_id,
            class_name=cls.name if cls else "Unknown",
            subject_id=e.subject_id,
            subject_name=subj.name if subj else "Unknown",
            day_of_week=e.day_of_week,
            start_time=str(e.start_time),
            end_time=str(e.end_time),
            room_number=e.room_number,
        ))
    return result


# ---------------------------------------------------------------------------
# GET /teacher/me/attendance/stats
# ---------------------------------------------------------------------------

@router.get("/me/attendance/stats", response_model=List[AttendanceStatOut], summary="Attendance stats per class")
def get_attendance_stats(
    current_user: User = Depends(require_permission("attendance:read")),
    db: Session = Depends(get_db),
) -> List[AttendanceStatOut]:
    """Per-class attendance statistics for all classes this teacher manages."""
    class_ids = _get_teacher_class_ids(db, current_user.id)
    if not class_ids:
        return []

    result = []
    for class_id in class_ids:
        cls = db.query(ClassRoom).filter(ClassRoom.id == class_id).first()
        if not cls:
            continue

        # Get all students in this class
        enrollments = (
            db.query(StudentEnrollment)
            .filter(StudentEnrollment.class_id == class_id)
            .all()
        )
        student_ids = [e.student_id for e in enrollments]
        if not student_ids:
            result.append(AttendanceStatOut(
                class_id=class_id, class_name=cls.name,
                total_records=0, present_count=0, attendance_rate=0.0,
            ))
            continue

        total = (
            db.query(AttendanceRecord)
            .filter(AttendanceRecord.student_id.in_(student_ids))
            .count()
        )
        present = (
            db.query(AttendanceRecord)
            .filter(
                AttendanceRecord.student_id.in_(student_ids),
                AttendanceRecord.status == "present",
            )
            .count()
        )
        rate = round((present / total * 100), 1) if total > 0 else 0.0
        result.append(AttendanceStatOut(
            class_id=class_id, class_name=cls.name,
            total_records=total, present_count=present, attendance_rate=rate,
        ))
    return result


# ---------------------------------------------------------------------------
# GET /teacher/me/students
# ---------------------------------------------------------------------------

@router.get("/me/students", response_model=List[StudentSummaryOut], summary="All my students")
def get_my_students(
    current_user: User = Depends(require_permission("attendance:read")),
    db: Session = Depends(get_db),
) -> List[StudentSummaryOut]:
    """All students across all classes this teacher is involved with."""
    class_ids = _get_teacher_class_ids(db, current_user.id)
    if not class_ids:
        return []

    enrollments = (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.class_id.in_(class_ids))
        .all()
    )
    result = []
    for e in enrollments:
        student = db.query(User).filter(User.id == e.student_id).first()
        cls = db.query(ClassRoom).filter(ClassRoom.id == e.class_id).first()
        if student and cls:
            result.append(StudentSummaryOut(
                id=student.id,
                name=student.name,
                email=student.email,
                class_id=cls.id,
                class_name=cls.name,
                roll_number=e.roll_number,
            ))
    return result


# ---------------------------------------------------------------------------
# GET /teacher/me/subjects
# ---------------------------------------------------------------------------

@router.get("/me/subjects", response_model=List[SubjectOut], summary="My subjects")
def get_my_subjects(
    current_user: User = Depends(require_permission("timetable:read")),
    db: Session = Depends(get_db),
) -> List[SubjectOut]:
    """Subjects this teacher teaches across all classes."""
    cs_rows = (
        db.query(ClassSubject)
        .filter(ClassSubject.teacher_id == current_user.id)
        .all()
    )
    subject_map: dict[str, dict] = {}
    for cs in cs_rows:
        subj = db.query(Subject).filter(Subject.id == cs.subject_id).first()
        if subj:
            if subj.id not in subject_map:
                subject_map[subj.id] = {
                    "id": subj.id, "name": subj.name,
                    "code": subj.code, "department": subj.department,
                    "class_count": 0,
                }
            subject_map[subj.id]["class_count"] += 1

    return [SubjectOut(**v) for v in subject_map.values()]


# ---------------------------------------------------------------------------
# PATCH /teacher/me/profile
# ---------------------------------------------------------------------------

@router.patch("/me/profile", summary="Update teacher profile")
def update_teacher_profile(
    payload: TeacherProfileUpdateIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Update basic profile fields for the current teacher."""
    if payload.name is not None:
        current_user.name = payload.name
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url
    db.commit()
    db.refresh(current_user)
    return {"id": current_user.id, "name": current_user.name, "avatar_url": current_user.avatar_url}
