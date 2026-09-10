"""Timetable, finance, events, profile, and dashboard repositories."""
import secrets
from typing import List, Optional
from datetime import date as dt_date
from sqlalchemy.orm import Session

from app.models.timetable import TimetableEntry
from app.models.finance import FeeInvoice, PaymentRecord
from app.models.communication import Event, Notification
from app.models.academic import StudentEnrollment, ClassSubject
from app.models.user import User, StudentProfile, TeacherProfile, ParentProfile


# ---------------------------------------------------------------------------
# Timetable
# ---------------------------------------------------------------------------

def _enrich_entry(e: TimetableEntry) -> dict:
    return {
        "id": e.id,
        "class_id": e.class_id,
        "class_name": e.classroom.name if e.classroom else None,
        "day_of_week": e.day_of_week,
        "start_time": e.start_time,
        "end_time": e.end_time,
        "subject_id": e.subject_id,
        "subject_name": e.subject.name if e.subject else None,
        "subject_code": e.subject.code if e.subject else None,
        "teacher_id": e.teacher_id,
        "teacher_name": e.teacher.name if e.teacher else None,
        "room_number": e.room_number,
    }


def get_timetable_for_class(
    db: Session, class_id: str, day_of_week: Optional[int] = None
) -> List[dict]:
    q = db.query(TimetableEntry).filter(TimetableEntry.class_id == class_id)
    if day_of_week is not None:
        q = q.filter(TimetableEntry.day_of_week == day_of_week)
    return [_enrich_entry(e) for e in q.order_by(TimetableEntry.day_of_week, TimetableEntry.start_time).all()]


def get_timetable_for_teacher(
    db: Session, teacher_id: str, day_of_week: Optional[int] = None
) -> List[dict]:
    q = db.query(TimetableEntry).filter(TimetableEntry.teacher_id == teacher_id)
    if day_of_week is not None:
        q = q.filter(TimetableEntry.day_of_week == day_of_week)
    return [_enrich_entry(e) for e in q.order_by(TimetableEntry.day_of_week, TimetableEntry.start_time).all()]


# ---------------------------------------------------------------------------
# Finance
# ---------------------------------------------------------------------------

def get_invoices_for_student(db: Session, student_id: str) -> List[FeeInvoice]:
    return (
        db.query(FeeInvoice)
        .filter(FeeInvoice.student_id == student_id)
        .order_by(FeeInvoice.due_date.asc())
        .all()
    )


def record_simulated_payment(
    db: Session, invoice_id: str, amount: float
) -> Optional[PaymentRecord]:
    invoice = db.query(FeeInvoice).filter(FeeInvoice.id == invoice_id).first()
    if not invoice:
        return None

    ref = f"SIM-{secrets.token_hex(6).upper()}"
    payment = PaymentRecord(
        invoice_id=invoice_id,
        amount_paid=amount,
        payment_method="simulated_sandbox",
        transaction_reference=ref,
        status="success",
    )
    db.add(payment)
    invoice.status = "paid"
    db.flush()
    return payment


# ---------------------------------------------------------------------------
# Events / Notifications
# ---------------------------------------------------------------------------

def get_upcoming_events(db: Session, limit: int = 10) -> List[Event]:
    today = dt_date.today().isoformat()
    return (
        db.query(Event)
        .filter(Event.date >= today)
        .order_by(Event.date.asc())
        .limit(limit)
        .all()
    )


def get_all_events(db: Session, limit: int = 20) -> List[Event]:
    return db.query(Event).order_by(Event.date.desc()).limit(limit).all()


def get_notifications_for_user(
    db: Session, user_id: str, unread_only: bool = False
) -> List[Notification]:
    q = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        q = q.filter(Notification.is_read == False)
    return q.order_by(Notification.created_at.desc()).limit(20).all()


def mark_notification_read(db: Session, notification_id: str, user_id: str) -> bool:
    n = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == user_id)
        .first()
    )
    if n:
        n.is_read = True
        db.flush()
        return True
    return False


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

def get_full_profile(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_student_enrollment(db: Session, student_id: str) -> Optional[StudentEnrollment]:
    return (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.student_id == student_id)
        .order_by(StudentEnrollment.academic_year.desc())
        .first()
    )


def get_teacher_classes(db: Session, teacher_id: str) -> List[dict]:
    """Return classes the teacher teaches (via ClassSubject)."""
    rows = (
        db.query(ClassSubject)
        .filter(ClassSubject.teacher_id == teacher_id)
        .all()
    )
    seen = set()
    result = []
    for r in rows:
        if r.class_id not in seen:
            seen.add(r.class_id)
            result.append({"id": r.class_id, "name": r.classroom.name if r.classroom else r.class_id})
    return result


def get_children_for_parent(db: Session, parent_user: User) -> List[User]:
    return list(parent_user.children) if parent_user.children else []
