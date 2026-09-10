"""Pydantic schemas for timetable, finance, events, profile, and dashboard."""
from typing import List, Optional
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Timetable
# ---------------------------------------------------------------------------

class TimetableEntryOut(BaseModel):
    id: str
    class_id: str
    class_name: Optional[str] = None
    day_of_week: int          # 0=Monday … 6=Sunday
    start_time: str           # HH:MM
    end_time: str
    subject_id: str
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None
    teacher_id: Optional[str] = None
    teacher_name: Optional[str] = None
    room_number: Optional[str] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Finance (simulated)
# ---------------------------------------------------------------------------

class FeeInvoiceOut(BaseModel):
    id: str
    student_id: str
    title: str
    amount: float
    due_date: str
    status: str               # paid | pending | overdue
    category_name: Optional[str] = None

    model_config = {"from_attributes": True}


class PaymentSimulateRequest(BaseModel):
    invoice_id: str
    amount: float


class PaymentRecordOut(BaseModel):
    id: str
    invoice_id: str
    amount_paid: float
    payment_method: str
    transaction_reference: str
    status: str

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Events / Notifications
# ---------------------------------------------------------------------------

class EventOut(BaseModel):
    id: str
    title: str
    description: str
    date: str
    time: str
    location: str
    type: str
    target_audience: str

    model_config = {"from_attributes": True}


class NotificationOut(BaseModel):
    id: str
    user_id: str
    title: str
    body: str
    type: str
    is_read: bool

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

class StudentProfileOut(BaseModel):
    roll_number: str
    admission_number: str
    section: str
    class_id: Optional[str] = None
    class_name: Optional[str] = None

    model_config = {"from_attributes": True}


class TeacherProfileOut(BaseModel):
    employee_id: str
    department: str
    designation: str
    is_class_teacher: bool
    class_teacher_of_id: Optional[str] = None
    class_teacher_of_name: Optional[str] = None

    model_config = {"from_attributes": True}


class ParentProfileOut(BaseModel):
    occupation: Optional[str] = None
    alternate_phone: Optional[str] = None
    children: List[dict] = []

    model_config = {"from_attributes": True}


class FullProfileOut(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    role: str
    is_active: bool
    student_profile: Optional[StudentProfileOut] = None
    teacher_profile: Optional[TeacherProfileOut] = None
    parent_profile: Optional[ParentProfileOut] = None


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

class DashboardSummaryOut(BaseModel):
    role: str
    # Student-specific
    attendance_percentage: Optional[float] = None
    present_days: Optional[int] = None
    absent_days: Optional[int] = None
    upcoming_exams: Optional[int] = None
    pending_fees: Optional[float] = None
    # Teacher-specific
    total_classes: Optional[int] = None
    subjects_teaching: Optional[int] = None
    students_count: Optional[int] = None
    # Parent-specific
    children_count: Optional[int] = None
    children_summaries: Optional[List[dict]] = None
    # Shared
    upcoming_events: Optional[int] = None
    unread_notifications: Optional[int] = None
