"""
Admin router — user management, class/subject management, role assignment, and global analytics.
Mounted under /api/v1/admin/...

Requires: users:manage or classes:manage permissions.
Admin role has wildcard bypass.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, EmailStr, Field

from app.core.dependencies import get_current_user, require_permission
from app.db.session import get_db
from app.models.user import User, Role, Permission, parent_students
from app.models.academic import ClassRoom, Subject, ClassSubject, StudentEnrollment
from app.models.attendance import AttendanceRecord
from app.models.marks import MarkRecord, ExamSubject, Exam
from app.models.finance import FeeInvoice, PaymentRecord
from app.repositories import user_repository
from app.core.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["Admin"])


# ---------------------------------------------------------------------------
# Schemas (inline for simplicity)
# ---------------------------------------------------------------------------

class UserCreateIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=150)
    role_id: str
    is_active: bool = True

class UserUpdateIn(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    role_id: Optional[str] = None
    avatar_url: Optional[str] = None

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    is_active: bool
    role_name: str
    avatar_url: Optional[str] = None

    model_config = {"from_attributes": True}

class RoleOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    model_config = {"from_attributes": True}

class ClassOut(BaseModel):
    id: str
    name: str
    grade_level: int
    section: str
    room_number: Optional[str] = None
    capacity: int
    class_teacher_id: Optional[str] = None
    teacher_name: Optional[str] = None
    student_count: int = 0
    model_config = {"from_attributes": True}

class ClassCreateIn(BaseModel):
    name: str
    grade_level: int
    section: str = "A"
    room_number: Optional[str] = None
    capacity: int = 40
    class_teacher_id: Optional[str] = None

class AssignTeacherIn(BaseModel):
    teacher_id: str

class SubjectOut(BaseModel):
    id: str
    name: str
    code: str
    department: Optional[str] = None
    model_config = {"from_attributes": True}

class SubjectCreateIn(BaseModel):
    name: str
    code: str
    department: Optional[str] = None

class EnrollmentIn(BaseModel):
    student_id: str
    class_id: str
    academic_year: str = "2026-2027"
    roll_number: str

# Analytics schemas
class MarksOverviewItem(BaseModel):
    student_id: str
    student_name: str
    subject: str
    exam_name: str
    marks_obtained: float
    max_marks: float
    grade: str

class AttendanceOverviewItem(BaseModel):
    student_id: str
    student_name: str
    date: str
    status: str
    class_name: str

class FeeOverviewItem(BaseModel):
    student_id: str
    student_name: str
    title: str
    amount: float
    due_date: str
    status: str

class AnalyticsOverview(BaseModel):
    enrollment: dict
    attendance: dict
    finance: dict


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _build_class_out(cls: ClassRoom, db: Session) -> ClassOut:
    teacher_name = None
    if cls.class_teacher_id:
        teacher = db.query(User).filter(User.id == cls.class_teacher_id).first()
        if teacher:
            teacher_name = teacher.name
    student_count = db.query(StudentEnrollment).filter(StudentEnrollment.class_id == cls.id).count()
    return ClassOut(
        id=cls.id,
        name=cls.name,
        grade_level=cls.grade_level,
        section=cls.section,
        room_number=cls.room_number,
        capacity=cls.capacity,
        class_teacher_id=cls.class_teacher_id,
        teacher_name=teacher_name,
        student_count=student_count,
    )


# ---------------------------------------------------------------------------
# Analytics Overview (reused by frontend dashboard)
# ---------------------------------------------------------------------------

@router.get("/analytics/overview", tags=["Admin Analytics"], summary="School-wide analytics overview")
def analytics_overview(
    _: User = Depends(require_permission("users:read")),
    db: Session = Depends(get_db),
) -> dict:
    student_role = db.query(Role).filter(Role.name == "student").first()
    teacher_role = db.query(Role).filter(Role.name == "teacher").first()
    parent_role = db.query(Role).filter(Role.name == "parent").first()

    students = db.query(User).filter(User.role_id == student_role.id, User.is_active == True).count() if student_role else 0
    teachers = db.query(User).filter(User.role_id == teacher_role.id, User.is_active == True).count() if teacher_role else 0
    parents = db.query(User).filter(User.role_id == parent_role.id, User.is_active == True).count() if parent_role else 0
    classes = db.query(ClassRoom).count()

    total_att = db.query(AttendanceRecord).count()
    present_att = db.query(AttendanceRecord).filter(AttendanceRecord.status == "present").count()
    att_pct = round((present_att / total_att * 100), 1) if total_att > 0 else 0.0

    invoices = db.query(FeeInvoice).all()
    total_invoiced = sum(inv.amount for inv in invoices)
    paid_invoices = [inv for inv in invoices if inv.status == "paid"]
    total_collected = sum(inv.amount for inv in paid_invoices)
    total_outstanding = total_invoiced - total_collected
    collection_rate = round((total_collected / total_invoiced * 100), 1) if total_invoiced > 0 else 0.0

    return {
        "enrollment": {"students": students, "teachers": teachers, "parents": parents, "classes": classes},
        "attendance": {"total_records": total_att, "present_records": present_att, "overall_percentage": att_pct},
        "finance": {
            "total_invoiced": total_invoiced,
            "total_collected": total_collected,
            "total_outstanding": total_outstanding,
            "collection_rate": collection_rate,
        },
    }


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

@router.get("/users", response_model=List[UserOut], summary="List all users")
def list_users(
    role_name: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    _: User = Depends(require_permission("users:read")),
    db: Session = Depends(get_db),
) -> List[UserOut]:
    q = db.query(User)
    if role_name:
        q = q.join(Role).filter(Role.name == role_name)
    if is_active is not None:
        q = q.filter(User.is_active == is_active)
    users = q.offset(offset).limit(limit).all()
    return [UserOut(id=u.id, email=u.email, name=u.name,
                    is_active=u.is_active, role_name=u.role.name if u.role else "",
                    avatar_url=u.avatar_url) for u in users]


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED, summary="Create user")
def create_user(
    payload: UserCreateIn,
    _: User = Depends(require_permission("users:manage")),
    db: Session = Depends(get_db),
) -> UserOut:
    existing = user_repository.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered.")
    role = db.query(Role).filter(Role.id == payload.role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")
    user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        name=payload.name,
        role_id=payload.role_id,
        is_active=payload.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserOut(id=user.id, email=user.email, name=user.name,
                   is_active=user.is_active, role_name=user.role.name)


@router.put("/users/{user_id}", response_model=UserOut, summary="Update user (PUT)")
@router.patch("/users/{user_id}", response_model=UserOut, summary="Update user (PATCH)")
def update_user(
    user_id: str,
    payload: UserUpdateIn,
    _: User = Depends(require_permission("users:manage")),
    db: Session = Depends(get_db),
) -> UserOut:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if payload.name is not None:
        user.name = payload.name
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.role_id is not None:
        role = db.query(Role).filter(Role.id == payload.role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found.")
        user.role_id = payload.role_id
    if payload.avatar_url is not None:
        user.avatar_url = payload.avatar_url
    db.commit()
    db.refresh(user)
    return UserOut(id=user.id, email=user.email, name=user.name,
                   is_active=user.is_active, role_name=user.role.name)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Deactivate user")
def deactivate_user(
    user_id: str,
    _: User = Depends(require_permission("users:manage")),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.is_active = False
    db.commit()


# ---------------------------------------------------------------------------
# Roles
# ---------------------------------------------------------------------------

@router.get("/roles", response_model=List[RoleOut], summary="List roles")
def list_roles(
    _: User = Depends(require_permission("users:read")),
    db: Session = Depends(get_db),
) -> List[RoleOut]:
    return db.query(Role).all()


# ---------------------------------------------------------------------------
# Classes
# ---------------------------------------------------------------------------

@router.get("/classes", response_model=List[ClassOut], summary="List classes")
def list_classes(
    _: User = Depends(require_permission("classes:read")),
    db: Session = Depends(get_db),
) -> List[ClassOut]:
    classes = db.query(ClassRoom).order_by(ClassRoom.grade_level, ClassRoom.section).all()
    return [_build_class_out(cls, db) for cls in classes]


@router.post("/classes", response_model=ClassOut, status_code=201, summary="Create class")
def create_class(
    payload: ClassCreateIn,
    _: User = Depends(require_permission("classes:manage")),
    db: Session = Depends(get_db),
) -> ClassOut:
    cls = ClassRoom(**payload.model_dump())
    db.add(cls)
    db.commit()
    db.refresh(cls)
    return _build_class_out(cls, db)


@router.patch("/classes/{class_id}", response_model=ClassOut, summary="Update class")
def update_class(
    class_id: str,
    payload: ClassCreateIn,
    _: User = Depends(require_permission("classes:manage")),
    db: Session = Depends(get_db),
) -> ClassOut:
    cls = db.query(ClassRoom).filter(ClassRoom.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found.")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(cls, k, v)
    db.commit()
    db.refresh(cls)
    return _build_class_out(cls, db)


@router.put("/classes/{class_id}/assign-teacher", response_model=ClassOut, summary="Assign or reassign class teacher")
def assign_class_teacher(
    class_id: str,
    payload: AssignTeacherIn,
    _: User = Depends(require_permission("classes:manage")),
    db: Session = Depends(get_db),
) -> ClassOut:
    cls = db.query(ClassRoom).filter(ClassRoom.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found.")
    teacher = db.query(User).filter(User.id == payload.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found.")
    cls.class_teacher_id = payload.teacher_id
    # Update teacher profile
    if teacher.teacher_profile:
        teacher.teacher_profile.is_class_teacher = True
        teacher.teacher_profile.class_teacher_of_class_id = class_id
    db.commit()
    db.refresh(cls)
    return _build_class_out(cls, db)


@router.delete("/classes/{class_id}", status_code=204, summary="Delete class")
def delete_class(
    class_id: str,
    _: User = Depends(require_permission("classes:manage")),
    db: Session = Depends(get_db),
):
    cls = db.query(ClassRoom).filter(ClassRoom.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found.")
    db.delete(cls)
    db.commit()


# ---------------------------------------------------------------------------
# Subjects
# ---------------------------------------------------------------------------

@router.get("/subjects", response_model=List[SubjectOut], summary="List subjects")
def list_subjects(
    _: User = Depends(require_permission("classes:read")),
    db: Session = Depends(get_db),
) -> List[SubjectOut]:
    return db.query(Subject).order_by(Subject.name).all()


@router.post("/subjects", response_model=SubjectOut, status_code=201, summary="Create subject")
def create_subject(
    payload: SubjectCreateIn,
    _: User = Depends(require_permission("classes:manage")),
    db: Session = Depends(get_db),
) -> SubjectOut:
    existing = db.query(Subject).filter(Subject.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=409, detail="Subject code already exists.")
    subj = Subject(**payload.model_dump())
    db.add(subj)
    db.commit()
    db.refresh(subj)
    return subj


# ---------------------------------------------------------------------------
# Enrollments
# ---------------------------------------------------------------------------

@router.post("/enrollments", status_code=201, summary="Enroll student in class")
def enroll_student(
    payload: EnrollmentIn,
    _: User = Depends(require_permission("classes:manage")),
    db: Session = Depends(get_db),
) -> dict:
    # Check student exists
    student = db.query(User).filter(User.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")
    cls = db.query(ClassRoom).filter(ClassRoom.id == payload.class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found.")
    enrollment = StudentEnrollment(
        student_id=payload.student_id,
        class_id=payload.class_id,
        academic_year=payload.academic_year,
        roll_number=payload.roll_number,
    )
    db.add(enrollment)
    db.commit()
    return {"enrolled": True, "class": cls.name, "student": student.name}


@router.get("/classes/{class_id}/students", summary="List students in class")
def class_students(
    class_id: str,
    academic_year: str = Query("2026-2027"),
    _: User = Depends(require_permission("classes:read")),
    db: Session = Depends(get_db),
) -> list:
    enrollments = (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.class_id == class_id,
                StudentEnrollment.academic_year == academic_year)
        .all()
    )
    return [
        {"id": e.student_id, "name": e.student.name, "roll_number": e.roll_number}
        for e in enrollments if e.student
    ]


# ---------------------------------------------------------------------------
# Global Academic & Fee Oversight
# ---------------------------------------------------------------------------

@router.get("/academics/marks", summary="Global marks overview (all classes)")
def admin_marks_overview(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    _: User = Depends(require_permission("marks:read")),
    db: Session = Depends(get_db),
) -> List[dict]:
    records = (
        db.query(MarkRecord)
        .offset(offset)
        .limit(limit)
        .all()
    )
    result = []
    for r in records:
        student = db.query(User).filter(User.id == r.student_id).first()
        es = db.query(ExamSubject).filter(ExamSubject.id == r.exam_subject_id).first()
        exam = db.query(Exam).filter(Exam.id == es.exam_id).first() if es else None
        result.append({
            "id": r.id,
            "student_id": r.student_id,
            "student_name": student.name if student else "Unknown",
            "subject": es.subject.name if es and es.subject else "Unknown",
            "exam_name": exam.name if exam else "Unknown",
            "marks_obtained": r.marks_obtained,
            "max_marks": es.max_marks if es else 100.0,
            "grade": r.grade,
        })
    return result


@router.get("/academics/attendance", summary="School-wide attendance metrics")
def admin_attendance_overview(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    _: User = Depends(require_permission("attendance:read")),
    db: Session = Depends(get_db),
) -> dict:
    total = db.query(AttendanceRecord).count()
    present = db.query(AttendanceRecord).filter(AttendanceRecord.status == "present").count()
    absent = db.query(AttendanceRecord).filter(AttendanceRecord.status == "absent").count()
    late = db.query(AttendanceRecord).filter(AttendanceRecord.status == "late").count()
    pct = round((present / total * 100), 1) if total > 0 else 0.0

    recent = (
        db.query(AttendanceRecord)
        .order_by(AttendanceRecord.date.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    records = []
    for r in recent:
        student = db.query(User).filter(User.id == r.student_id).first()
        cls = db.query(ClassRoom).filter(ClassRoom.id == r.class_id).first()
        records.append({
            "id": r.id,
            "student_id": r.student_id,
            "student_name": student.name if student else "Unknown",
            "date": r.date,
            "status": r.status,
            "class_name": cls.name if cls else "Unknown",
        })

    return {
        "summary": {"total": total, "present": present, "absent": absent, "late": late, "attendance_rate": pct},
        "records": records,
    }


@router.get("/finance/fees", summary="Fee dues and payment collection status")
def admin_fees_overview(
    status_filter: Optional[str] = Query(None, description="paid | pending | overdue"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    _: User = Depends(require_permission("finance:read")),
    db: Session = Depends(get_db),
) -> dict:
    q = db.query(FeeInvoice)
    if status_filter:
        q = q.filter(FeeInvoice.status == status_filter)
    invoices = q.offset(offset).limit(limit).all()

    all_invoices = db.query(FeeInvoice).all()
    total_amount = sum(inv.amount for inv in all_invoices)
    paid_amount = sum(inv.amount for inv in all_invoices if inv.status == "paid")
    pending_amount = sum(inv.amount for inv in all_invoices if inv.status == "pending")
    overdue_amount = sum(inv.amount for inv in all_invoices if inv.status == "overdue")
    collection_rate = round((paid_amount / total_amount * 100), 1) if total_amount > 0 else 0.0

    items = []
    for inv in invoices:
        student = db.query(User).filter(User.id == inv.student_id).first()
        items.append({
            "id": inv.id,
            "student_id": inv.student_id,
            "student_name": student.name if student else "Unknown",
            "title": inv.title,
            "amount": inv.amount,
            "due_date": inv.due_date,
            "status": inv.status,
        })

    return {
        "summary": {
            "total_invoiced": total_amount,
            "total_collected": paid_amount,
            "total_pending": pending_amount,
            "total_overdue": overdue_amount,
            "collection_rate": collection_rate,
            "total_invoices": len(all_invoices),
        },
        "invoices": items,
    }

