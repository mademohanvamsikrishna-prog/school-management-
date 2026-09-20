"""
Domain routers — mounted at /api/v1.

POST /attendance/class/{class_id}/mark     — attendance:mark
GET  /attendance/student/{student_id}/summary — attendance:read
GET  /attendance/student/{student_id}/records — attendance:read

GET  /marks/exams                          — marks:read
GET  /marks/student/{student_id}           — marks:read
POST /marks/enter                          — marks:write

GET  /timetable/class/{class_id}           — timetable:read
GET  /timetable/teacher/{teacher_id}       — timetable:read

GET  /finance/student/{student_id}/invoices — finance:read
POST /finance/pay/simulate                 — finance:pay_mock

GET  /events                               — authenticated
GET  /notifications/me                     — authenticated

GET  /profile/me                           — authenticated
GET  /dashboard/summary                    — authenticated
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_permission
from app.db.session import get_db
from app.models.user import User
from app.services import domain_service as svc
from app.schemas.attendance import AttendanceSummaryOut, AttendanceRecordOut, MarkAttendanceRequest
from app.schemas.marks import ExamOut, MarkRecordOut, EnterMarkRequest
from app.schemas.domain import (
    TimetableEntryOut, FeeInvoiceOut, PaymentSimulateRequest, PaymentRecordOut,
    EventOut, NotificationOut, FullProfileOut, DashboardSummaryOut,
)

router = APIRouter()


# ===========================================================================
# Ownership helper
# ===========================================================================

def _assert_student_access(current_user: User, student_id: str) -> None:
    """
    Enforce record-level ownership for student-scoped endpoints.

    Rules
    -----
    admin   -> unrestricted (wildcard).
    student -> may only access their own records.
    parent  -> may only access records of children linked via parent_students.
    teacher -> denied (teacher-class-to-student mapping is not implemented;
               returning 403 is safer than allowing unrestricted access).

    Raises HTTP 403 with a clear message on any violation.
    """
    role_name: str = current_user.role.name if current_user.role else ""

    if role_name == "admin":
        return  # Admin may access all records

    if role_name == "student":
        if current_user.id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Students may only access their own records.",
            )
        return

    if role_name == "parent":
        child_ids = {child.id for child in current_user.children}
        if student_id not in child_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Parents may only access records of their linked children.",
            )
        return

    if role_name in ("teacher", "staff"):
        # Teacher-to-student access via class assignment is not implemented.
        # Return 403 rather than accidentally granting open access.
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Teachers are not permitted to access individual student records "
                "via this endpoint. Use the class-level analytics endpoints instead."
            ),
        )

    # Unknown role — deny by default
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied.",
    )


# ===========================================================================
# Attendance
# ===========================================================================

@router.post(
    "/attendance/class/{class_id}/mark",
    status_code=status.HTTP_200_OK,
    tags=["Attendance"],
    summary="Mark class attendance",
)
def mark_attendance(
    class_id: str,
    payload: MarkAttendanceRequest,
    teacher: User = Depends(require_permission("attendance:mark")),
    db: Session = Depends(get_db),
) -> dict:
    count = svc.mark_attendance(db, payload, teacher_id=teacher.id)
    return {"marked": count, "date": payload.date}


@router.get(
    "/attendance/student/{student_id}/summary",
    response_model=AttendanceSummaryOut,
    tags=["Attendance"],
    summary="Student attendance summary",
)
def attendance_summary(
    student_id: str,
    current_user: User = Depends(require_permission("attendance:read")),
    db: Session = Depends(get_db),
) -> AttendanceSummaryOut:
    _assert_student_access(current_user, student_id)
    return svc.get_attendance_summary(db, student_id)


@router.get(
    "/attendance/student/{student_id}/records",
    response_model=List[AttendanceRecordOut],
    tags=["Attendance"],
    summary="Student attendance records",
)
def attendance_records(
    student_id: str,
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_permission("attendance:read")),
    db: Session = Depends(get_db),
) -> List[AttendanceRecordOut]:
    _assert_student_access(current_user, student_id)
    return svc.get_attendance_records(db, student_id, limit, offset)


# ===========================================================================
# Marks
# ===========================================================================

@router.get(
    "/marks/exams",
    response_model=List[ExamOut],
    tags=["Marks"],
    summary="List all exams",
)
def list_exams(
    _: User = Depends(require_permission("marks:read")),
    db: Session = Depends(get_db),
) -> List[ExamOut]:
    return svc.list_exams(db)


@router.get(
    "/marks/student/{student_id}",
    response_model=List[MarkRecordOut],
    tags=["Marks"],
    summary="Student marks",
)
def student_marks(
    student_id: str,
    exam_id: Optional[str] = Query(None),
    current_user: User = Depends(require_permission("marks:read")),
    db: Session = Depends(get_db),
) -> List[MarkRecordOut]:
    _assert_student_access(current_user, student_id)
    return svc.get_student_marks(db, student_id, exam_id)


@router.post(
    "/marks/enter",
    response_model=MarkRecordOut,
    tags=["Marks"],
    summary="Enter / update a mark",
)
def enter_mark(
    payload: EnterMarkRequest,
    teacher: User = Depends(require_permission("marks:write")),
    db: Session = Depends(get_db),
) -> MarkRecordOut:
    return svc.enter_mark(db, payload, teacher_id=teacher.id)


# ===========================================================================
# Timetable
# ===========================================================================

@router.get(
    "/timetable/class/{class_id}",
    response_model=List[TimetableEntryOut],
    tags=["Timetable"],
    summary="Class timetable",
)
def class_timetable(
    class_id: str,
    day: Optional[int] = Query(None, ge=1, le=6, description="1=Monday ... 6=Saturday"),
    _: User = Depends(require_permission("timetable:read")),
    db: Session = Depends(get_db),
) -> List[TimetableEntryOut]:
    return svc.get_class_timetable(db, class_id, day)


@router.get(
    "/timetable/teacher/{teacher_id}",
    response_model=List[TimetableEntryOut],
    tags=["Timetable"],
    summary="Teacher timetable",
)
def teacher_timetable(
    teacher_id: str,
    day: Optional[int] = Query(None, ge=1, le=6),
    _: User = Depends(require_permission("timetable:read")),
    db: Session = Depends(get_db),
) -> List[TimetableEntryOut]:
    return svc.get_teacher_timetable(db, teacher_id, day)


# ===========================================================================
# Finance (Simulated)
# ===========================================================================

@router.get(
    "/finance/student/{student_id}/invoices",
    response_model=List[FeeInvoiceOut],
    tags=["Finance"],
    summary="Student fee invoices",
)
def student_invoices(
    student_id: str,
    current_user: User = Depends(require_permission("finance:read")),
    db: Session = Depends(get_db),
) -> List[FeeInvoiceOut]:
    _assert_student_access(current_user, student_id)
    return svc.get_student_invoices(db, student_id)


@router.post(
    "/finance/pay/simulate",
    response_model=PaymentRecordOut,
    tags=["Finance"],
    summary="[SIMULATED] Record a payment",
    description=(
        "SIMULATED PAYMENT ONLY. No real money is transferred. "
        "This endpoint records a mock payment for development and demo purposes."
    ),
)
def simulate_payment(
    payload: PaymentSimulateRequest,
    current_user: User = Depends(require_permission("finance:pay_mock")),
    db: Session = Depends(get_db),
) -> PaymentRecordOut:
    return svc.simulate_payment_for_user(db, payload, current_user=current_user)


# ===========================================================================
# Events / Notifications
# ===========================================================================

@router.get(
    "/events",
    response_model=List[EventOut],
    tags=["Events"],
    summary="School events",
)
def list_events(
    upcoming_only: bool = Query(False),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[EventOut]:
    return svc.list_events(db, upcoming_only)


@router.get(
    "/notifications/me",
    response_model=List[NotificationOut],
    tags=["Notifications"],
    summary="My notifications",
)
def my_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[NotificationOut]:
    return svc.list_notifications(db, current_user.id)


# ===========================================================================
# Profile
# ===========================================================================

@router.get(
    "/profile/me",
    response_model=FullProfileOut,
    tags=["Profile"],
    summary="Full authenticated user profile",
)
def my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FullProfileOut:
    return svc.get_full_profile(db, current_user)


# ===========================================================================
# Dashboard
# ===========================================================================

@router.get(
    "/dashboard/summary",
    response_model=DashboardSummaryOut,
    tags=["Dashboard"],
    summary="Role-aware dashboard summary stats",
)
def dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardSummaryOut:
    return svc.get_dashboard_summary(db, current_user)


# ===========================================================================
# Events CRUD (admin/events:manage)
# ===========================================================================

from pydantic import BaseModel as _BM
from app.models.communication import Event as _Event, Notification as _Notification
from app.repositories.domain_repository import mark_notification_read


class EventCreateIn(_BM):
    title: str
    description: str
    date: str
    time: str
    location: str
    type: str = "academic"
    target_audience: str = "all"


@router.post(
    "/events",
    tags=["Events"],
    status_code=201,
    summary="Create event (admin)",
)
def create_event(
    payload: EventCreateIn,
    _: User = Depends(require_permission("events:manage")),
    db: Session = Depends(get_db),
) -> dict:
    event = _Event(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return {"id": event.id, "title": event.title}


@router.patch(
    "/events/{event_id}",
    tags=["Events"],
    summary="Update event (admin)",
)
def update_event(
    event_id: str,
    payload: EventCreateIn,
    _: User = Depends(require_permission("events:manage")),
    db: Session = Depends(get_db),
) -> dict:
    from fastapi import HTTPException as _HTTPException
    event = db.query(_Event).filter(_Event.id == event_id).first()
    if not event:
        raise _HTTPException(status_code=404, detail="Event not found.")
    for k, v in payload.model_dump().items():
        setattr(event, k, v)
    db.commit()
    return {"id": event_id, "updated": True}


@router.delete(
    "/events/{event_id}",
    tags=["Events"],
    status_code=204,
    summary="Delete event (admin)",
)
def delete_event(
    event_id: str,
    _: User = Depends(require_permission("events:manage")),
    db: Session = Depends(get_db),
):
    from fastapi import HTTPException as _HTTPException
    event = db.query(_Event).filter(_Event.id == event_id).first()
    if not event:
        raise _HTTPException(status_code=404, detail="Event not found.")
    db.delete(event)
    db.commit()


# ===========================================================================
# Notifications
# ===========================================================================

@router.post(
    "/notifications/{notification_id}/read",
    tags=["Notifications"],
    summary="Mark notification as read",
)
def mark_notification_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    success = mark_notification_read(db, notification_id, current_user.id)
    db.commit()
    return {"read": success}


# ===========================================================================
# Timetable Management (admin/timetable:manage)
# ===========================================================================

from app.models.timetable import TimetableEntry as _TTEntry


class TimetableCreateIn(_BM):
    class_id: str
    subject_id: str
    teacher_id: str
    day_of_week: int
    start_time: str
    end_time: str
    room_number: str


@router.post(
    "/timetable",
    tags=["Timetable"],
    status_code=201,
    summary="Create timetable entry (admin)",
)
def create_timetable_entry(
    payload: TimetableCreateIn,
    _: User = Depends(require_permission("timetable:manage")),
    db: Session = Depends(get_db),
) -> dict:
    from fastapi import HTTPException as _HTTPException
    from sqlalchemy import and_
    # Conflict detection: teacher double-booked
    teacher_conflict = db.query(_TTEntry).filter(
        _TTEntry.teacher_id == payload.teacher_id,
        _TTEntry.day_of_week == payload.day_of_week,
        _TTEntry.start_time == payload.start_time,
    ).first()
    if teacher_conflict:
        raise _HTTPException(status_code=409, detail="Teacher already has a class at this time slot.")
    # Class conflict
    class_conflict = db.query(_TTEntry).filter(
        _TTEntry.class_id == payload.class_id,
        _TTEntry.day_of_week == payload.day_of_week,
        _TTEntry.start_time == payload.start_time,
    ).first()
    if class_conflict:
        raise _HTTPException(status_code=409, detail="Class already has a lesson at this time slot.")

    entry = _TTEntry(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"id": entry.id, "created": True}


@router.delete(
    "/timetable/{entry_id}",
    tags=["Timetable"],
    status_code=204,
    summary="Delete timetable entry (admin)",
)
def delete_timetable_entry(
    entry_id: str,
    _: User = Depends(require_permission("timetable:manage")),
    db: Session = Depends(get_db),
):
    from fastapi import HTTPException as _HTTPException
    entry = db.query(_TTEntry).filter(_TTEntry.id == entry_id).first()
    if not entry:
        raise _HTTPException(status_code=404, detail="Entry not found.")
    db.delete(entry)
    db.commit()


# ===========================================================================
# Exam management (admin/marks:write)
# ===========================================================================

from app.models.marks import Exam as _Exam, ExamSubject as _ExamSubject


class ExamCreateIn(_BM):
    name: str
    term: str
    academic_year: str = "2026-2027"
    start_date: str
    end_date: str
    status: str = "upcoming"


@router.post(
    "/marks/exams",
    tags=["Marks"],
    status_code=201,
    summary="Create exam (admin)",
)
def create_exam(
    payload: ExamCreateIn,
    _: User = Depends(require_permission("marks:write")),
    db: Session = Depends(get_db),
) -> dict:
    exam = _Exam(**payload.model_dump())
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return {"id": exam.id, "name": exam.name}


@router.patch(
    "/marks/exams/{exam_id}/status",
    tags=["Marks"],
    summary="Update exam status",
)
def update_exam_status(
    exam_id: str,
    new_status: str = Query(..., pattern="^(upcoming|ongoing|completed)$"),
    _: User = Depends(require_permission("marks:write")),
    db: Session = Depends(get_db),
) -> dict:
    from fastapi import HTTPException as _HTTPException
    exam = db.query(_Exam).filter(_Exam.id == exam_id).first()
    if not exam:
        raise _HTTPException(status_code=404, detail="Exam not found.")
    exam.status = new_status
    db.commit()
    return {"id": exam_id, "status": new_status}


# ===========================================================================
# Attendance -- date range filter + edit
# ===========================================================================

@router.get(
    "/attendance/student/{student_id}/history",
    tags=["Attendance"],
    summary="Student attendance history with date filter",
)
def attendance_history(
    student_id: str,
    from_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    to_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    limit: int = Query(60, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_permission("attendance:read")),
    db: Session = Depends(get_db),
) -> list:
    _assert_student_access(current_user, student_id)
    from app.models.attendance import AttendanceRecord as _AR
    q = db.query(_AR).filter(_AR.student_id == student_id)
    if from_date:
        q = q.filter(_AR.date >= from_date)
    if to_date:
        q = q.filter(_AR.date <= to_date)
    records = q.order_by(_AR.date.desc()).offset(offset).limit(limit).all()
    return [{"id": r.id, "date": r.date, "status": r.status, "remarks": r.remarks} for r in records]
