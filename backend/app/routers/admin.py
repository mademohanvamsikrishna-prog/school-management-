"""
Admin router — user management, class/subject management, role assignment.
Mounted under /api/v1/admin/...

Requires: users:manage or classes:manage permissions.
Admin role has wildcard bypass.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field

from app.core.dependencies import get_current_user, require_permission
from app.db.session import get_db
from app.models.user import User, Role, Permission
from app.models.academic import ClassRoom, Subject, ClassSubject, StudentEnrollment
from app.repositories import user_repository
from app.core.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["Admin"])


# ---------------------------------------------------------------------------
# Schemas (inline for simplicity)
# ---------------------------------------------------------------------------

class UserCreateIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
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
    model_config = {"from_attributes": True}

class ClassCreateIn(BaseModel):
    name: str
    grade_level: int
    section: str = "A"
    room_number: Optional[str] = None
    capacity: int = 40
    class_teacher_id: Optional[str] = None

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


@router.patch("/users/{user_id}", response_model=UserOut, summary="Update user")
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
    return db.query(ClassRoom).order_by(ClassRoom.grade_level, ClassRoom.section).all()


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
    return cls


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
    return cls


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
    _: User = Depends(require_permission("subjects:read")),
    db: Session = Depends(get_db),
) -> List[SubjectOut]:
    return db.query(Subject).order_by(Subject.name).all()


@router.post("/subjects", response_model=SubjectOut, status_code=201, summary="Create subject")
def create_subject(
    payload: SubjectCreateIn,
    _: User = Depends(require_permission("subjects:manage")),
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
