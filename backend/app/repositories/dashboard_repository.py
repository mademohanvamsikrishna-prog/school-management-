"""
dashboard_repository.py — CRUD operations for student dashboard modules.

Provides reusable DB helpers for:
  - StudentAssignment  (student_assignments table)
  - Notice             (notices table)
  - StudentLeave       (student_leaves table)

All write operations call db.flush() (not db.commit()) so callers can
wrap multiple operations in a single transaction.  The service layer is
responsible for calling db.commit() / db.rollback().
"""
from typing import List, Optional, Type, TypeVar

from sqlalchemy.orm import Session

from app.db.base import generate_uuid, utc_now
from app.models.dashboard_modules import Notice, StudentAssignment, StudentLeave

# ---------------------------------------------------------------------------
# Typing helpers
# ---------------------------------------------------------------------------

M = TypeVar("M")


def _apply_updates(instance: M, updates: dict) -> M:
    """Apply a dict of field → value onto an ORM model instance."""
    for key, value in updates.items():
        setattr(instance, key, value)
    instance.updated_at = utc_now()  # type: ignore[attr-defined]
    return instance


# ===========================================================================
# StudentAssignment
# ===========================================================================

def create_assignment(
    db: Session,
    payload: dict,
    student_id: str,
) -> StudentAssignment:
    """Insert a new StudentAssignment row and flush."""
    item = StudentAssignment(
        id=generate_uuid(),
        student_id=student_id,
        **payload,
    )
    db.add(item)
    db.flush()
    db.refresh(item)
    return item


def get_assignments(
    db: Session,
    student_id: str,
    limit: int = 20,
    offset: int = 0,
    status_filter: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
) -> tuple[List[StudentAssignment], int]:
    """Return (items, total_count) with optional filters."""
    q = db.query(StudentAssignment).filter(StudentAssignment.student_id == student_id)
    if status_filter:
        q = q.filter(StudentAssignment.status == status_filter)
    if date_from:
        q = q.filter(StudentAssignment.due_date >= date_from)
    if date_to:
        q = q.filter(StudentAssignment.due_date <= date_to)
    total = q.count()
    items = (
        q.order_by(StudentAssignment.due_date.asc(), StudentAssignment.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def get_assignment_by_id(db: Session, item_id: str) -> Optional[StudentAssignment]:
    return db.query(StudentAssignment).filter(StudentAssignment.id == item_id).first()


def update_assignment(
    db: Session,
    item_id: str,
    payload: dict,
) -> Optional[StudentAssignment]:
    """Partial update — only fields present in payload are written."""
    item = get_assignment_by_id(db, item_id)
    if not item:
        return None
    _apply_updates(item, payload)
    db.flush()
    db.refresh(item)
    return item


def delete_assignment(db: Session, item_id: str) -> bool:
    """Delete a StudentAssignment. Returns True if deleted, False if not found."""
    item = get_assignment_by_id(db, item_id)
    if not item:
        return False
    db.delete(item)
    db.flush()
    return True


# ===========================================================================
# Notice
# ===========================================================================

def create_notice(
    db: Session,
    payload: dict,
    posted_by_id: Optional[str] = None,
) -> Notice:
    """Insert a new Notice row and flush."""
    item = Notice(
        id=generate_uuid(),
        posted_by_id=posted_by_id,
        **payload,
    )
    db.add(item)
    db.flush()
    db.refresh(item)
    return item


def get_notices(
    db: Session,
    limit: int = 20,
    offset: int = 0,
    target_role: Optional[str] = None,
    category: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    pinned_first: bool = True,
) -> tuple[List[Notice], int]:
    """Return (items, total_count). By default, pinned notices appear first."""
    q = db.query(Notice)
    if target_role:
        # Return notices for this role OR notices targeting 'all'
        q = q.filter(
            (Notice.target_role == target_role) | (Notice.target_role == "all")
        )
    if category:
        q = q.filter(Notice.category == category)
    if date_from:
        q = q.filter(Notice.date >= date_from)
    if date_to:
        q = q.filter(Notice.date <= date_to)
    total = q.count()
    order = []
    if pinned_first:
        order.append(Notice.is_pinned.desc())
    order.extend([Notice.date.desc(), Notice.created_at.desc()])
    items = q.order_by(*order).offset(offset).limit(limit).all()
    return items, total


def get_notice_by_id(db: Session, item_id: str) -> Optional[Notice]:
    return db.query(Notice).filter(Notice.id == item_id).first()


def update_notice(
    db: Session,
    item_id: str,
    payload: dict,
) -> Optional[Notice]:
    item = get_notice_by_id(db, item_id)
    if not item:
        return None
    _apply_updates(item, payload)
    db.flush()
    db.refresh(item)
    return item


def delete_notice(db: Session, item_id: str) -> bool:
    item = get_notice_by_id(db, item_id)
    if not item:
        return False
    db.delete(item)
    db.flush()
    return True


# ===========================================================================
# StudentLeave
# ===========================================================================

def create_leave(
    db: Session,
    payload: dict,
    student_id: str,
) -> StudentLeave:
    """Insert a new StudentLeave row and flush."""
    item = StudentLeave(
        id=generate_uuid(),
        student_id=student_id,
        **payload,
    )
    db.add(item)
    db.flush()
    db.refresh(item)
    return item


def get_leaves(
    db: Session,
    student_id: str,
    limit: int = 20,
    offset: int = 0,
    status_filter: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
) -> tuple[List[StudentLeave], int]:
    q = db.query(StudentLeave).filter(StudentLeave.student_id == student_id)
    if status_filter:
        q = q.filter(StudentLeave.status == status_filter)
    if date_from:
        q = q.filter(StudentLeave.start_date >= date_from)
    if date_to:
        q = q.filter(StudentLeave.end_date <= date_to)
    total = q.count()
    items = (
        q.order_by(StudentLeave.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def get_leave_by_id(db: Session, item_id: str) -> Optional[StudentLeave]:
    return db.query(StudentLeave).filter(StudentLeave.id == item_id).first()


def update_leave(
    db: Session,
    item_id: str,
    payload: dict,
) -> Optional[StudentLeave]:
    item = get_leave_by_id(db, item_id)
    if not item:
        return None
    _apply_updates(item, payload)
    db.flush()
    db.refresh(item)
    return item


def delete_leave(db: Session, item_id: str) -> bool:
    item = get_leave_by_id(db, item_id)
    if not item:
        return False
    db.delete(item)
    db.flush()
    return True
