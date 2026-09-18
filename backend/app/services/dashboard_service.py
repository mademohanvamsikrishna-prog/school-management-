"""
dashboard_service.py — Orchestration / business-logic layer for student dashboard modules.

Sits between the API router and the repository.  Responsibilities:
  - Translate repository results into clean response dicts / objects.
  - Raise HTTPException on business-rule violations (not-found, ownership, bad state).
  - Call db.commit() after successful mutations.

Convention:
  All mutating helpers accept `db` as first arg, perform the repo call,
  call db.commit(), then return the updated ORM instance.
  On failure, HTTPException is raised and the caller's exception handler
  lets SQLAlchemy roll back naturally via db.close() in the session context.
"""
from typing import List, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.dashboard_modules import Notice, StudentAssignment, StudentLeave
from app.repositories import dashboard_repository as repo
from app.schemas.dashboard_modules import (
    NoticeCreate,
    NoticeUpdate,
    StudentAssignmentCreate,
    StudentAssignmentUpdate,
    StudentLeaveCreate,
    StudentLeaveUpdate,
)


# ---------------------------------------------------------------------------
# Ownership guard (reused by the router helper as well)
# ---------------------------------------------------------------------------

def _assert_owner(
    owner_id: str,
    current_user_id: str,
    role_name: str,
    resource_name: str = "resource",
) -> None:
    """Admin may touch anything; students/parents only their own records."""
    if role_name == "admin":
        return
    if owner_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You do not have permission to modify this {resource_name}.",
        )


def _not_found(resource: str, item_id: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{resource} '{item_id}' not found.",
    )


# ===========================================================================
# StudentAssignment service
# ===========================================================================

def svc_create_assignment(
    db: Session,
    payload: StudentAssignmentCreate,
    student_id: str,
) -> StudentAssignment:
    data = payload.model_dump(exclude_none=False)
    item = repo.create_assignment(db, data, student_id)
    db.commit()
    db.refresh(item)
    return item


def svc_list_assignments(
    db: Session,
    student_id: str,
    limit: int,
    offset: int,
    status_filter: Optional[str],
    date_from: Optional[str],
    date_to: Optional[str],
) -> Tuple[List[StudentAssignment], int]:
    return repo.get_assignments(db, student_id, limit, offset, status_filter, date_from, date_to)


def svc_get_assignment(db: Session, item_id: str) -> StudentAssignment:
    item = repo.get_assignment_by_id(db, item_id)
    if not item:
        raise _not_found("Assignment", item_id)
    return item


def svc_update_assignment(
    db: Session,
    item_id: str,
    payload: StudentAssignmentUpdate,
    current_user_id: str,
    role_name: str,
) -> StudentAssignment:
    existing = repo.get_assignment_by_id(db, item_id)
    if not existing:
        raise _not_found("Assignment", item_id)
    _assert_owner(existing.student_id, current_user_id, role_name, "assignment")
    updates = payload.model_dump(exclude_unset=True)
    item = repo.update_assignment(db, item_id, updates)
    db.commit()
    db.refresh(item)
    return item


def svc_delete_assignment(
    db: Session,
    item_id: str,
    current_user_id: str,
    role_name: str,
) -> None:
    existing = repo.get_assignment_by_id(db, item_id)
    if not existing:
        raise _not_found("Assignment", item_id)
    _assert_owner(existing.student_id, current_user_id, role_name, "assignment")
    repo.delete_assignment(db, item_id)
    db.commit()


# ===========================================================================
# Notice service
# ===========================================================================

def svc_create_notice(
    db: Session,
    payload: NoticeCreate,
    posted_by_id: str,
) -> Notice:
    data = payload.model_dump(exclude_none=False)
    item = repo.create_notice(db, data, posted_by_id)
    db.commit()
    db.refresh(item)
    return item


def svc_list_notices(
    db: Session,
    limit: int,
    offset: int,
    target_role: Optional[str],
    category: Optional[str],
    date_from: Optional[str],
    date_to: Optional[str],
) -> Tuple[List[Notice], int]:
    return repo.get_notices(db, limit, offset, target_role, category, date_from, date_to)


def svc_get_notice(db: Session, item_id: str) -> Notice:
    item = repo.get_notice_by_id(db, item_id)
    if not item:
        raise _not_found("Notice", item_id)
    return item


def svc_update_notice(
    db: Session,
    item_id: str,
    payload: NoticeUpdate,
    current_user_id: str,
    role_name: str,
) -> Notice:
    existing = repo.get_notice_by_id(db, item_id)
    if not existing:
        raise _not_found("Notice", item_id)
    # Only admin or the original poster can edit notices
    if role_name != "admin":
        if existing.posted_by_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the notice poster or an admin may edit this notice.",
            )
    updates = payload.model_dump(exclude_unset=True)
    item = repo.update_notice(db, item_id, updates)
    db.commit()
    db.refresh(item)
    return item


def svc_delete_notice(
    db: Session,
    item_id: str,
    current_user_id: str,
    role_name: str,
) -> None:
    existing = repo.get_notice_by_id(db, item_id)
    if not existing:
        raise _not_found("Notice", item_id)
    if role_name != "admin":
        if existing.posted_by_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the notice poster or an admin may delete this notice.",
            )
    repo.delete_notice(db, item_id)
    db.commit()


# ===========================================================================
# StudentLeave service
# ===========================================================================

def svc_create_leave(
    db: Session,
    payload: StudentLeaveCreate,
    student_id: str,
) -> StudentLeave:
    if payload.end_date < payload.start_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="end_date must be on or after start_date.",
        )
    data = payload.model_dump(exclude_none=False)
    item = repo.create_leave(db, data, student_id)
    db.commit()
    db.refresh(item)
    return item


def svc_list_leaves(
    db: Session,
    student_id: str,
    limit: int,
    offset: int,
    status_filter: Optional[str],
    date_from: Optional[str],
    date_to: Optional[str],
) -> Tuple[List[StudentLeave], int]:
    return repo.get_leaves(db, student_id, limit, offset, status_filter, date_from, date_to)


def svc_get_leave(db: Session, item_id: str) -> StudentLeave:
    item = repo.get_leave_by_id(db, item_id)
    if not item:
        raise _not_found("Leave request", item_id)
    return item


def svc_update_leave(
    db: Session,
    item_id: str,
    payload: StudentLeaveUpdate,
    current_user_id: str,
    role_name: str,
) -> StudentLeave:
    existing = repo.get_leave_by_id(db, item_id)
    if not existing:
        raise _not_found("Leave request", item_id)

    # Students can only cancel their own pending requests or edit fields before approval
    if role_name == "student":
        _assert_owner(existing.student_id, current_user_id, role_name, "leave request")
        if existing.status not in ("pending",):
            new_status = payload.model_dump(exclude_unset=True).get("status")
            if new_status and new_status != "cancelled":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Students may only cancel leave requests that are still pending.",
                )

    updates = payload.model_dump(exclude_unset=True)
    item = repo.update_leave(db, item_id, updates)
    db.commit()
    db.refresh(item)
    return item


def svc_delete_leave(
    db: Session,
    item_id: str,
    current_user_id: str,
    role_name: str,
) -> None:
    existing = repo.get_leave_by_id(db, item_id)
    if not existing:
        raise _not_found("Leave request", item_id)
    _assert_owner(existing.student_id, current_user_id, role_name, "leave request")
    # Prevent deleting already-approved requests
    if existing.status == "approved" and role_name != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Approved leave requests cannot be deleted. Cancel or contact admin.",
        )
    repo.delete_leave(db, item_id)
    db.commit()
