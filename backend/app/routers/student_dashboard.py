"""
student_dashboard.py — RESTful CRUD router for Student Dashboard modules.

Mounted at /api/v1/students/dashboard under the main api_v1_router.

Endpoints:
  POST   /students/dashboard/assignments          Create assignment
  GET    /students/dashboard/assignments          List assignments (paginated + filtered)
  GET    /students/dashboard/assignments/{id}     Get single assignment
  PATCH  /students/dashboard/assignments/{id}     Partial update
  DELETE /students/dashboard/assignments/{id}     Delete (204)

  POST   /students/dashboard/notices              Create notice
  GET    /students/dashboard/notices              List notices (paginated + filtered)
  GET    /students/dashboard/notices/{id}         Get single notice
  PATCH  /students/dashboard/notices/{id}         Partial update
  DELETE /students/dashboard/notices/{id}         Delete (204)

  POST   /students/dashboard/leaves              Apply for leave
  GET    /students/dashboard/leaves              List my leave requests (paginated + filtered)
  GET    /students/dashboard/leaves/{id}         Get single leave request
  PATCH  /students/dashboard/leaves/{id}         Partial update / cancel / approve
  DELETE /students/dashboard/leaves/{id}         Withdraw leave request (204)
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.dashboard_modules import (
    NoticeCreate,
    NoticeResponse,
    NoticeUpdate,
    PaginatedResponse,
    StudentAssignmentCreate,
    StudentAssignmentResponse,
    StudentAssignmentUpdate,
    StudentLeaveCreate,
    StudentLeaveResponse,
    StudentLeaveUpdate,
)
from app.services import dashboard_service as svc

router = APIRouter(prefix="/students/dashboard", tags=["Student Dashboard"])


def _role_name(user: User) -> str:
    return user.role.name if user.role else ""


# ===========================================================================
# Assignments
# ===========================================================================

@router.post(
    "/assignments",
    response_model=StudentAssignmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new assignment/homework entry",
)
def create_assignment(
    payload: StudentAssignmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return svc.svc_create_assignment(db, payload, current_user.id)


@router.get(
    "/assignments",
    response_model=PaginatedResponse[StudentAssignmentResponse],
    summary="List assignments for the current student",
)
def list_assignments(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status: Optional[str] = Query(default=None, description="Filter by status: pending|in_progress|completed|submitted|overdue"),
    date_from: Optional[str] = Query(default=None, description="Filter due_date >= YYYY-MM-DD"),
    date_to: Optional[str] = Query(default=None, description="Filter due_date <= YYYY-MM-DD"),
    student_id: Optional[str] = Query(default=None, description="Admin only — view another student's assignments"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role = _role_name(current_user)
    target_id = current_user.id
    if student_id and role == "admin":
        target_id = student_id

    items, total = svc.svc_list_assignments(db, target_id, limit, offset, status, date_from, date_to)
    return PaginatedResponse(items=items, total=total, limit=limit, offset=offset)


@router.get(
    "/assignments/{assignment_id}",
    response_model=StudentAssignmentResponse,
    summary="Get a single assignment by ID",
)
def get_assignment(
    assignment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = svc.svc_get_assignment(db, assignment_id)
    # Ownership: students can only see their own
    if _role_name(current_user) == "student" and item.student_id != current_user.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Access denied.")
    return item


@router.patch(
    "/assignments/{assignment_id}",
    response_model=StudentAssignmentResponse,
    summary="Partially update an assignment (e.g. mark as done, add notes)",
)
def patch_assignment(
    assignment_id: str,
    payload: StudentAssignmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return svc.svc_update_assignment(
        db, assignment_id, payload, current_user.id, _role_name(current_user)
    )


@router.delete(
    "/assignments/{assignment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an assignment entry",
)
def delete_assignment(
    assignment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc.svc_delete_assignment(db, assignment_id, current_user.id, _role_name(current_user))


# ===========================================================================
# Notices / Announcements
# ===========================================================================

@router.post(
    "/notices",
    response_model=NoticeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Post a new notice/announcement (admin or teacher)",
)
def create_notice(
    payload: NoticeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return svc.svc_create_notice(db, payload, current_user.id)


@router.get(
    "/notices",
    response_model=PaginatedResponse[NoticeResponse],
    summary="List notices visible to the current user",
)
def list_notices(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    category: Optional[str] = Query(default=None, description="Filter by category"),
    date_from: Optional[str] = Query(default=None, description="Filter date >= YYYY-MM-DD"),
    date_to: Optional[str] = Query(default=None, description="Filter date <= YYYY-MM-DD"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role = _role_name(current_user)
    # Filter notices relevant to the current user's role
    target_role = role if role in ("student", "teacher", "parent") else None
    items, total = svc.svc_list_notices(db, limit, offset, target_role, category, date_from, date_to)
    return PaginatedResponse(items=items, total=total, limit=limit, offset=offset)


@router.get(
    "/notices/{notice_id}",
    response_model=NoticeResponse,
    summary="Get a single notice by ID",
)
def get_notice(
    notice_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return svc.svc_get_notice(db, notice_id)


@router.patch(
    "/notices/{notice_id}",
    response_model=NoticeResponse,
    summary="Partially update a notice (edit text, pin/unpin, acknowledge)",
)
def patch_notice(
    notice_id: str,
    payload: NoticeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return svc.svc_update_notice(
        db, notice_id, payload, current_user.id, _role_name(current_user)
    )


@router.delete(
    "/notices/{notice_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a notice",
)
def delete_notice(
    notice_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc.svc_delete_notice(db, notice_id, current_user.id, _role_name(current_user))


# ===========================================================================
# Student Leave Requests
# ===========================================================================

@router.post(
    "/leaves",
    response_model=StudentLeaveResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Apply for a student leave",
)
def create_leave(
    payload: StudentLeaveCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return svc.svc_create_leave(db, payload, current_user.id)


@router.get(
    "/leaves",
    response_model=PaginatedResponse[StudentLeaveResponse],
    summary="List my leave requests",
)
def list_leaves(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status: Optional[str] = Query(default=None, description="Filter by status: pending|approved|rejected|cancelled"),
    date_from: Optional[str] = Query(default=None, description="Filter start_date >= YYYY-MM-DD"),
    date_to: Optional[str] = Query(default=None, description="Filter end_date <= YYYY-MM-DD"),
    student_id: Optional[str] = Query(default=None, description="Admin only — view another student's leaves"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role = _role_name(current_user)
    target_id = current_user.id
    if student_id and role == "admin":
        target_id = student_id

    items, total = svc.svc_list_leaves(db, target_id, limit, offset, status, date_from, date_to)
    return PaginatedResponse(items=items, total=total, limit=limit, offset=offset)


@router.get(
    "/leaves/{leave_id}",
    response_model=StudentLeaveResponse,
    summary="Get a single leave request by ID",
)
def get_leave(
    leave_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = svc.svc_get_leave(db, leave_id)
    if _role_name(current_user) == "student" and item.student_id != current_user.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Access denied.")
    return item


@router.patch(
    "/leaves/{leave_id}",
    response_model=StudentLeaveResponse,
    summary="Update a leave request (cancel, approve, reject, add rejection reason)",
)
def patch_leave(
    leave_id: str,
    payload: StudentLeaveUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return svc.svc_update_leave(
        db, leave_id, payload, current_user.id, _role_name(current_user)
    )


@router.delete(
    "/leaves/{leave_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Withdraw / delete a leave request",
)
def delete_leave(
    leave_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc.svc_delete_leave(db, leave_id, current_user.id, _role_name(current_user))
