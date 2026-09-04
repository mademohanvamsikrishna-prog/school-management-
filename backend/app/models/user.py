from typing import List, Optional
from sqlalchemy import Boolean, Column, ForeignKey, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid

# Junction Table: Role <-> Permission
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", String(36), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", String(36), ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)

# Junction Table: Parent <-> Student
parent_students = Table(
    "parent_students",
    Base.metadata,
    Column("parent_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("student_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("relationship_type", String(50), default="guardian"),
)


class Permission(Base, TimestampMixin):
    __tablename__ = "permissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    code: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    module: Mapped[str] = mapped_column(String(50), index=True, nullable=False)

    roles: Mapped[List["Role"]] = relationship(
        "Role",
        secondary=role_permissions,
        back_populates="permissions",
    )


class Role(Base, TimestampMixin):
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    users: Mapped[List["User"]] = relationship("User", back_populates="role")
    permissions: Mapped[List[Permission]] = relationship(
        Permission,
        secondary=role_permissions,
        back_populates="roles",
        lazy="selectin",
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    role_id: Mapped[str] = mapped_column(String(36), ForeignKey("roles.id"), nullable=False)
    role: Mapped[Role] = relationship("Role", back_populates="users", lazy="joined")

    # Specific profiles
    student_profile: Mapped[Optional["StudentProfile"]] = relationship(
        "StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    teacher_profile: Mapped[Optional["TeacherProfile"]] = relationship(
        "TeacherProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    parent_profile: Mapped[Optional["ParentProfile"]] = relationship(
        "ParentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )

    # Parent-child relationships
    children: Mapped[List["User"]] = relationship(
        "User",
        secondary=parent_students,
        primaryjoin="User.id == parent_students.c.parent_id",
        secondaryjoin="User.id == parent_students.c.student_id",
        back_populates="parents",
    )
    parents: Mapped[List["User"]] = relationship(
        "User",
        secondary=parent_students,
        primaryjoin="User.id == parent_students.c.student_id",
        secondaryjoin="User.id == parent_students.c.parent_id",
        back_populates="children",
    )

    def has_permission(self, permission_code: str) -> bool:
        if not self.role:
            return False
        # Admin wildcard permission
        if self.role.name == "admin":
            return True
        return any(p.code == permission_code for p in self.role.permissions)

    @property
    def permission_codes(self) -> List[str]:
        if not self.role:
            return []
        return [p.code for p in self.role.permissions]


class StudentProfile(Base, TimestampMixin):
    __tablename__ = "student_profiles"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    roll_number: Mapped[str] = mapped_column(String(50), nullable=False)
    admission_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    current_class_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    section: Mapped[str] = mapped_column(String(10), default="A")
    date_of_birth: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    blood_group: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)

    user: Mapped[User] = relationship("User", back_populates="student_profile")


class TeacherProfile(Base, TimestampMixin):
    __tablename__ = "teacher_profiles"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    employee_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    qualification: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    is_class_teacher: Mapped[bool] = mapped_column(Boolean, default=False)
    class_teacher_of_class_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    user: Mapped[User] = relationship("User", back_populates="teacher_profile")


class ParentProfile(Base, TimestampMixin):
    __tablename__ = "parent_profiles"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    alternate_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    occupation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped[User] = relationship("User", back_populates="parent_profile")
