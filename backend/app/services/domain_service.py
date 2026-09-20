"""
All domain service functions (attendance, marks, timetable, finance, events, profile, dashboard).
Business logic only — no FastAPI types.
"""
from datetime import date as dt_date
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.finance import FeeInvoice
from app.repositories import attendance_repository as att_repo
from app.repositories import marks_repository as marks_repo
from app.repositories import domain_repository as dom_repo
from app.schemas.attendance import AttendanceSummaryOut, AttendanceRecordOut, MarkAttendanceRequest
from app.schemas.marks import ExamOut, MarkRecordOut, EnterMarkRequest, MarkReportOut
from app.schemas.domain import (
    TimetableEntryOut, FeeInvoiceOut, PaymentSimulateRequest, PaymentRecordOut,
    EventOut, NotificationOut, FullProfileOut, StudentProfileOut, TeacherProfileOut,
    ParentProfileOut, DashboardSummaryOut,
)


# ---------------------------------------------------------------------------
# Attendance
# ---------------------------------------------------------------------------

def get_attendance_summary(db: Session, student_id: str) -> AttendanceSummaryOut:
    data = att_repo.get_summary_for_student(db, student_id)
    return AttendanceSummaryOut(**data)


def get_attendance_records(
    db: Session, student_id: str, limit: int = 30, offset: int = 0
) -> List[AttendanceRecordOut]:
    rows = att_repo.get_records_for_student(db, student_id, limit, offset)
    return [AttendanceRecordOut.model_validate(r) for r in rows]


def mark_attendance(
    db: Session, req: MarkAttendanceRequest, teacher_id: str
) -> int:
    today = dt_date.today().isoformat()
    if req.date > today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot record attendance for a future date.",
        )
    valid_statuses = {"present", "absent", "late", "half_day"}
    for item in req.records:
        if item.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid status '{item.status}'. Must be one of: {valid_statuses}",
            )
        att_repo.upsert_attendance(
            db,
            student_id=item.student_id,
            class_id=req.class_id,
            date=req.date,
            status=item.status,
            remarks=item.remarks,
            teacher_id=teacher_id,
        )
    db.commit()
    return len(req.records)


# ---------------------------------------------------------------------------
# Marks
# ---------------------------------------------------------------------------

def list_exams(db: Session) -> List[ExamOut]:
    exams = marks_repo.get_all_exams(db)
    return [ExamOut.model_validate(e) for e in exams]


def get_student_marks(
    db: Session, student_id: str, exam_id: Optional[str] = None
) -> List[MarkRecordOut]:
    rows = marks_repo.get_marks_for_student(db, student_id, exam_id)
    return [MarkRecordOut(**r) for r in rows]


def enter_mark(db: Session, req: EnterMarkRequest, teacher_id: str) -> MarkRecordOut:
    es = marks_repo.get_exam_subject(db, req.exam_subject_id)
    if not es:
        raise HTTPException(status_code=404, detail="Exam subject not found.")
    if req.marks_obtained < 0 or req.marks_obtained > es.max_marks:
        raise HTTPException(
            status_code=422,
            detail=f"Marks must be between 0 and {es.max_marks}.",
        )
    record = marks_repo.upsert_mark(
        db,
        exam_subject_id=req.exam_subject_id,
        student_id=req.student_id,
        marks_obtained=req.marks_obtained,
        max_marks=es.max_marks,
        passing_marks=es.passing_marks,
        remarks=req.remarks,
        teacher_id=teacher_id,
    )
    db.commit()
    enriched = marks_repo.get_marks_for_student(db, req.student_id, es.exam_id)
    for m in enriched:
        if m["id"] == record.id:
            return MarkRecordOut(**m)
    return MarkRecordOut.model_validate(record)


# ---------------------------------------------------------------------------
# Timetable
# ---------------------------------------------------------------------------

def get_class_timetable(
    db: Session, class_id: str, day_of_week: Optional[int] = None
) -> List[TimetableEntryOut]:
    entries = dom_repo.get_timetable_for_class(db, class_id, day_of_week)
    return [TimetableEntryOut(**e) for e in entries]


def get_teacher_timetable(
    db: Session, teacher_id: str, day_of_week: Optional[int] = None
) -> List[TimetableEntryOut]:
    entries = dom_repo.get_timetable_for_teacher(db, teacher_id, day_of_week)
    return [TimetableEntryOut(**e) for e in entries]


# ---------------------------------------------------------------------------
# Finance
# ---------------------------------------------------------------------------

def get_student_invoices(db: Session, student_id: str) -> List[FeeInvoiceOut]:
    invoices = dom_repo.get_invoices_for_student(db, student_id)
    result = []
    for inv in invoices:
        result.append(FeeInvoiceOut(
            id=inv.id,
            student_id=inv.student_id,
            title=inv.title,
            amount=inv.amount,
            due_date=inv.due_date,
            status=inv.status,
            category_name=inv.category.name if inv.category else None,
        ))
    return result


def simulate_payment(db: Session, req: PaymentSimulateRequest, student_id: str) -> PaymentRecordOut:
    invoice = dom_repo.get_invoices_for_student(db, student_id)
    inv_ids = {i.id for i in invoice}
    if req.invoice_id not in inv_ids:
        raise HTTPException(status_code=403, detail="Invoice does not belong to this student.")

    payment = dom_repo.record_simulated_payment(db, req.invoice_id, req.amount)
    if not payment:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    db.commit()
    return PaymentRecordOut.model_validate(payment)


def simulate_payment_for_user(db: Session, req: PaymentSimulateRequest, current_user: User) -> PaymentRecordOut:
    inv = db.query(FeeInvoice).filter(FeeInvoice.id == req.invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    role_name = current_user.role.name if current_user.role else ""
    if role_name == "student" and inv.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Students may only pay their own invoices.")
    elif role_name == "parent":
        child_ids = {child.id for child in current_user.children}
        if inv.student_id not in child_ids:
            raise HTTPException(status_code=403, detail="Parents may only pay invoices of their linked children.")

    payment = dom_repo.record_simulated_payment(db, req.invoice_id, req.amount)
    if not payment:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    db.commit()
    return PaymentRecordOut.model_validate(payment)


# ---------------------------------------------------------------------------
# Events / Notifications
# ---------------------------------------------------------------------------

def list_events(db: Session, upcoming_only: bool = False) -> List[EventOut]:
    rows = dom_repo.get_upcoming_events(db) if upcoming_only else dom_repo.get_all_events(db)
    return [EventOut.model_validate(e) for e in rows]


def list_notifications(db: Session, user_id: str) -> List[NotificationOut]:
    rows = dom_repo.get_notifications_for_user(db, user_id)
    return [NotificationOut.model_validate(n) for n in rows]


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

def get_full_profile(db: Session, user: User) -> FullProfileOut:
    sp = tp = pp = None

    if user.student_profile:
        enrollment = dom_repo.get_student_enrollment(db, user.id)
        sp = StudentProfileOut(
            roll_number=user.student_profile.roll_number,
            admission_number=user.student_profile.admission_number,
            section=user.student_profile.section,
            class_id=enrollment.class_id if enrollment else None,
            class_name=enrollment.classroom.name if enrollment and enrollment.classroom else None,
        )

    if user.teacher_profile:
        prof = user.teacher_profile
        tp = TeacherProfileOut(
            employee_id=prof.employee_id,
            department=prof.department,
            designation=prof.designation,
            is_class_teacher=prof.is_class_teacher,
            class_teacher_of_id=prof.class_teacher_of_id,
            class_teacher_of_name=None,
        )

    if user.parent_profile:
        children = dom_repo.get_children_for_parent(db, user)
        child_list = []
        for c in children:
            sp_data = None
            if c.student_profile:
                enr = dom_repo.get_student_enrollment(db, c.id)
                sp_data = {
                    "roll_number": c.student_profile.roll_number,
                    "admission_number": c.student_profile.admission_number,
                    "section": c.student_profile.section,
                    "class_name": enr.classroom.name if enr and enr.classroom else None,
                    "grade_level": enr.classroom.grade_level if enr and enr.classroom else None,
                    "date_of_birth": c.student_profile.date_of_birth,
                    "gender": c.student_profile.gender,
                    "blood_group": c.student_profile.blood_group,
                }
            child_list.append({
                "id": c.id,
                "name": c.name,
                "email": c.email,
                "avatar_url": c.avatar_url,
                "student_profile": sp_data,
            })
        pp = ParentProfileOut(
            occupation=user.parent_profile.occupation,
            alternate_phone=user.parent_profile.alternate_phone,
            children=child_list,
        )

    return FullProfileOut(
        id=user.id,
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url,
        role=user.role.name,
        is_active=user.is_active,
        student_profile=sp,
        teacher_profile=tp,
        parent_profile=pp,
    )


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

def get_dashboard_summary(db: Session, user: User) -> DashboardSummaryOut:
    role = user.role.name
    notifs = dom_repo.get_notifications_for_user(db, user.id, unread_only=True)
    upcoming = dom_repo.get_upcoming_events(db, limit=100)
    unread = len(notifs)
    upcoming_count = len(upcoming)

    if role == "student":
        summary = att_repo.get_summary_for_student(db, user.id)
        exams = marks_repo.get_all_exams(db)
        upcoming_exams = sum(1 for e in exams if e.status == "upcoming")
        invoices = dom_repo.get_invoices_for_student(db, user.id)
        pending_fees = sum(i.amount for i in invoices if i.status in ("pending", "overdue"))
        return DashboardSummaryOut(
            role=role,
            attendance_percentage=summary["percentage"],
            present_days=summary["present_days"],
            absent_days=summary["absent_days"],
            upcoming_exams=upcoming_exams,
            pending_fees=pending_fees,
            upcoming_events=upcoming_count,
            unread_notifications=unread,
        )

    if role == "teacher":
        classes = dom_repo.get_teacher_classes(db, user.id)
        from app.models.academic import ClassSubject
        subjects = db.query(ClassSubject).filter(ClassSubject.teacher_id == user.id).count()
        from app.models.academic import StudentEnrollment
        class_ids = [c["id"] for c in classes]
        students_count = (
            db.query(StudentEnrollment)
            .filter(StudentEnrollment.class_id.in_(class_ids))
            .count() if class_ids else 0
        )
        return DashboardSummaryOut(
            role=role,
            total_classes=len(classes),
            subjects_teaching=subjects,
            students_count=students_count,
            upcoming_events=upcoming_count,
            unread_notifications=unread,
        )

    if role == "parent":
        children = dom_repo.get_children_for_parent(db, user)
        summaries = []
        for child in children:
            s = att_repo.get_summary_for_student(db, child.id)
            invoices = dom_repo.get_invoices_for_student(db, child.id)
            pending = sum(i.amount for i in invoices if i.status in ("pending", "overdue"))
            summaries.append({
                "id": child.id,
                "name": child.name,
                "attendance_percentage": s["percentage"],
                "pending_fees": pending,
            })
        return DashboardSummaryOut(
            role=role,
            children_count=len(children),
            children_summaries=summaries,
            upcoming_events=upcoming_count,
            unread_notifications=unread,
        )

    # Admin / staff fallback
    return DashboardSummaryOut(role=role, upcoming_events=upcoming_count, unread_notifications=unread)
