"""
Pydantic schemas for Student Dashboard CRUD modules:
  - StudentAssignment  (homework/coursework tracker)
  - Notice             (announcements/circulars)
  - StudentLeave       (leave application & status)
"""
from __future__ import annotations

from datetime import datetime
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Generic paginated response envelope
# ---------------------------------------------------------------------------

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    limit: int
    offset: int


# ===========================================================================
# StudentAssignment
# ===========================================================================

ASSIGNMENT_STATUS = {"pending", "in_progress", "completed", "submitted", "overdue"}
ASSIGNMENT_PRIORITY = {"low", "medium", "high", "urgent"}


class StudentAssignmentBase(BaseModel):
    subject_name: str = Field(..., max_length=100, description="Subject this assignment belongs to")
    title: str = Field(..., max_length=200, description="Assignment title")
    description: str = Field(..., description="Assignment description / instructions")
    due_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Due date YYYY-MM-DD")
    status: str = Field(default="pending", description="pending | in_progress | completed | submitted | overdue")
    priority: str = Field(default="medium", description="low | medium | high | urgent")
    submission_notes: Optional[str] = Field(default=None, description="Student submission notes")
    attachment_url: Optional[str] = Field(default=None, max_length=255)
    max_score: float = Field(default=100.0, ge=0)
    class_id: Optional[str] = Field(default=None, max_length=36)


class StudentAssignmentCreate(StudentAssignmentBase):
    """Payload for POST /students/dashboard/assignments"""
    pass


class StudentAssignmentUpdate(BaseModel):
    """All fields optional — supports partial PATCH."""
    subject_name: Optional[str] = Field(default=None, max_length=100)
    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = None
    due_date: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    status: Optional[str] = None
    priority: Optional[str] = None
    submission_notes: Optional[str] = None
    attachment_url: Optional[str] = Field(default=None, max_length=255)
    score: Optional[float] = Field(default=None, ge=0)
    max_score: Optional[float] = Field(default=None, ge=0)
    class_id: Optional[str] = Field(default=None, max_length=36)


class StudentAssignmentResponse(StudentAssignmentBase):
    id: str
    student_id: str
    score: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===========================================================================
# Notice (Announcement / Circular)
# ===========================================================================

NOTICE_CATEGORY = {"academic", "exam", "event", "sports", "general", "fee", "hostel"}
NOTICE_TARGET_ROLE = {"all", "student", "teacher", "parent"}


class NoticeBase(BaseModel):
    title: str = Field(..., max_length=200)
    content: str = Field(..., description="Full notice body text")
    category: str = Field(default="academic", description="academic | exam | event | sports | general | fee | hostel")
    priority: str = Field(default="medium", description="low | medium | high | urgent")
    target_role: str = Field(default="all", description="all | student | teacher | parent")
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Notice date YYYY-MM-DD")
    class_id: Optional[str] = Field(default=None, max_length=36)
    is_pinned: bool = Field(default=False)


class NoticeCreate(NoticeBase):
    """Payload for POST /students/dashboard/notices"""
    pass


class NoticeUpdate(BaseModel):
    """All fields optional — supports partial PATCH."""
    title: Optional[str] = Field(default=None, max_length=200)
    content: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    target_role: Optional[str] = None
    date: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    class_id: Optional[str] = Field(default=None, max_length=36)
    is_pinned: Optional[bool] = None
    is_acknowledged: Optional[bool] = None


class NoticeResponse(NoticeBase):
    id: str
    posted_by_id: Optional[str] = None
    is_acknowledged: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===========================================================================
# StudentLeave
# ===========================================================================

LEAVE_TYPE_CHOICES = {"Medical", "Casual", "Family Emergency", "Study Leave", "Personal"}
LEAVE_STATUS = {"pending", "approved", "rejected", "cancelled"}


class StudentLeaveBase(BaseModel):
    leave_type: str = Field(default="Medical", description="Medical | Casual | Family Emergency | Study Leave | Personal")
    start_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Start date YYYY-MM-DD")
    end_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="End date YYYY-MM-DD")
    days_count: float = Field(default=1.0, ge=0.5, description="Number of days (can be 0.5 for half-day)")
    reason: str = Field(..., min_length=10, description="Reason for leave (min 10 chars)")


class StudentLeaveCreate(StudentLeaveBase):
    """Payload for POST /students/dashboard/leaves"""
    pass


class StudentLeaveUpdate(BaseModel):
    """All fields optional — supports partial PATCH."""
    leave_type: Optional[str] = None
    start_date: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    end_date: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    days_count: Optional[float] = Field(default=None, ge=0.5)
    reason: Optional[str] = None
    status: Optional[str] = Field(default=None, description="pending | approved | rejected | cancelled")
    rejection_reason: Optional[str] = None


class StudentLeaveResponse(StudentLeaveBase):
    id: str
    student_id: str
    status: str
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
