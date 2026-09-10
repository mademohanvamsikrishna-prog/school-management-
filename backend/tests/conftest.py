"""
pytest configuration and shared fixtures for the backend test suite.

Test database policy:
    - Always uses SQLite in-memory (":memory:") for speed and isolation.
    - Each test gets a fresh database via the `db` session fixture.
    - The FastAPI test client is scoped to the session to reduce startup overhead.

Seed credentials (created by the `seed_users` fixture):
    active_admin      admin@test.edu    / testpass123
    active_teacher    teacher@test.edu  / testpass123
    active_student    student@test.edu  / testpass123
    inactive_user     inactive@test.edu / testpass123   (is_active=False)
"""
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient
from typing import Generator

# Force testing environment so production DB guard is not triggered
os.environ.setdefault("ENVIRONMENT", "testing")

from app.main import app, api_v1_router  # noqa: E402
from app.db.base import Base
from app.db.session import get_db
from app.core.security import get_password_hash
from app.models.user import Permission, Role, User, StudentProfile


# ---------------------------------------------------------------------------
# In-memory SQLite test engine
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    """Create all tables once per test session."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def db() -> Session:
    """
    Provide a clean, isolated DB session per test.
    Uses SAVEPOINT-based rollback so each test starts with a clean slate
    without recreating all tables.
    """
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestSessionLocal(bind=connection)

    # Begin a nested transaction (SAVEPOINT) so we can roll back after the test
    nested = connection.begin_nested()

    yield session

    session.close()
    # Roll back to SAVEPOINT → test isolation
    if nested.is_active:
        nested.rollback()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def seed_users(db: Session):
    """
    Insert the minimal set of users needed for auth tests.
    Returns a dict of {name: User} for test assertions.
    """
    hashed = get_password_hash("testpass123")

    # --- Permissions ---
    p_students_read = Permission(code="students:read", name="View Students", description="", module="students")
    p_marks_write = Permission(code="marks:write", name="Enter Marks", description="", module="marks")
    p_marks_read = Permission(code="marks:read", name="View Marks", description="", module="marks")
    p_attendance_mark = Permission(code="attendance:mark", name="Mark Attendance", description="", module="attendance")
    p_attendance_read = Permission(code="attendance:read", name="View Attendance", description="", module="attendance")
    p_timetable_read = Permission(code="timetable:read", name="View Timetable", description="", module="timetable")
    p_finance_read = Permission(code="finance:read", name="View Finance", description="", module="finance")
    p_finance_mock = Permission(code="finance:pay_mock", name="Simulate Payment", description="", module="finance")
    db.add_all([p_students_read, p_marks_write, p_marks_read, p_attendance_mark,
                p_attendance_read, p_timetable_read, p_finance_read, p_finance_mock])
    db.flush()

    # --- Roles ---
    admin_role = Role(
        name="admin",
        description="Administrator",
        permissions=[p_students_read, p_marks_write, p_marks_read, p_attendance_mark,
                     p_attendance_read, p_timetable_read, p_finance_read, p_finance_mock],
    )
    teacher_role = Role(
        name="teacher",
        description="Teacher",
        permissions=[p_students_read, p_marks_write, p_marks_read,
                     p_attendance_mark, p_attendance_read, p_timetable_read],
    )
    student_role = Role(
        name="student",
        description="Student",
        permissions=[p_students_read, p_marks_read, p_attendance_read,
                     p_timetable_read, p_finance_read, p_finance_mock],
    )
    db.add_all([admin_role, teacher_role, student_role])
    db.flush()

    # --- Users ---
    admin = User(email="admin@test.edu", hashed_password=hashed, name="Test Admin", role_id=admin_role.id)
    teacher = User(email="teacher@test.edu", hashed_password=hashed, name="Test Teacher", role_id=teacher_role.id)
    student = User(email="student@test.edu", hashed_password=hashed, name="Test Student", role_id=student_role.id)
    student.student_profile = StudentProfile(roll_number="001", admission_number="ADM-TEST-001", section="A")

    inactive = User(
        email="inactive@test.edu",
        hashed_password=hashed,
        name="Inactive User",
        role_id=student_role.id,
        is_active=False,
    )

    db.add_all([admin, teacher, student, inactive])
    db.commit()

    return {
        "admin": admin,
        "teacher": teacher,
        "student": student,
        "inactive": inactive,
    }


@pytest.fixture()
def client(db: Session):
    """
    FastAPI TestClient with the test DB session injected via dependency override.
    """
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def db_session(db: Session):
    """Alias for db, used in extended tests."""
    return db


@pytest.fixture()
def seed_users_extended(db: Session):
    """
    Extended seed including all permissions needed for P4-P21 tests.
    Also sets up admin, teacher, student with ALL relevant permissions.
    """
    hashed = get_password_hash("testpass123")

    # --- ALL permissions ---
    perm_data = [
        ("students:read", "View Students", "students"),
        ("students:write", "Manage Students", "students"),
        ("teachers:read", "View Teachers", "teachers"),
        ("teachers:write", "Manage Teachers", "teachers"),
        ("parents:read", "View Parents", "parents"),
        ("parents:write", "Manage Parents", "parents"),
        ("classes:read", "View Classes", "classes"),
        ("classes:manage", "Manage Classes", "classes"),
        ("subjects:read", "View Subjects", "subjects"),
        ("subjects:manage", "Manage Subjects", "subjects"),
        ("attendance:read", "View Attendance", "attendance"),
        ("attendance:mark", "Mark Attendance", "attendance"),
        ("marks:read", "View Marks", "marks"),
        ("marks:write", "Enter Marks", "marks"),
        ("timetable:read", "View Timetable", "timetable"),
        ("timetable:manage", "Manage Timetable", "timetable"),
        ("finance:read", "View Finance", "finance"),
        ("finance:manage", "Manage Finance", "finance"),
        ("finance:pay_mock", "Simulate Payment", "finance"),
        ("events:read", "View Events", "events"),
        ("events:manage", "Manage Events", "events"),
        ("notifications:read", "View Notifications", "notifications"),
        ("notifications:manage", "Manage Notifications", "notifications"),
        ("chat:participate", "Participate in Chat", "chat"),
        ("chat:manage", "Manage Chat", "chat"),
        ("users:read", "View Users", "users"),
        ("users:manage", "Manage Users", "users"),
    ]
    perms = {}
    for code, name, module in perm_data:
        p = Permission(code=code, name=name, description="", module=module)
        db.add(p)
        perms[code] = p
    db.flush()

    all_perms = list(perms.values())

    # Student perms
    student_perms = [
        perms["students:read"], perms["marks:read"], perms["attendance:read"],
        perms["timetable:read"], perms["finance:read"], perms["finance:pay_mock"],
        perms["events:read"], perms["notifications:read"], perms["chat:participate"],
    ]
    # Teacher perms
    teacher_perms = [
        perms["students:read"], perms["marks:read"], perms["marks:write"],
        perms["attendance:read"], perms["attendance:mark"], perms["timetable:read"],
        perms["events:read"], perms["notifications:read"], perms["chat:participate"],
        perms["classes:read"], perms["subjects:read"],
    ]

    admin_role = Role(name="admin", description="Administrator", permissions=all_perms)
    teacher_role = Role(name="teacher", description="Teacher", permissions=teacher_perms)
    student_role = Role(name="student", description="Student", permissions=student_perms)
    parent_role = Role(name="parent", description="Parent", permissions=[
        perms["students:read"], perms["marks:read"], perms["attendance:read"],
        perms["finance:read"], perms["finance:pay_mock"], perms["events:read"],
        perms["notifications:read"], perms["chat:participate"],
    ])
    db.add_all([admin_role, teacher_role, student_role, parent_role])
    db.flush()

    admin = User(email="admin@test.edu", hashed_password=hashed, name="Test Admin", role_id=admin_role.id)
    teacher = User(email="teacher@test.edu", hashed_password=hashed, name="Test Teacher", role_id=teacher_role.id)
    student = User(email="student@test.edu", hashed_password=hashed, name="Test Student", role_id=student_role.id)
    student.student_profile = StudentProfile(roll_number="001", admission_number="ADM-TEST-X01", section="A")
    inactive = User(email="inactive@test.edu", hashed_password=hashed, name="Inactive", role_id=student_role.id, is_active=False)

    db.add_all([admin, teacher, student, inactive])
    db.commit()
    return {"admin": admin, "teacher": teacher, "student": student, "inactive": inactive}


def _get_token(client, email: str) -> str:
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": "testpass123"})
    assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture()
def admin_token(client, seed_users_extended):
    return _get_token(client, "admin@test.edu")


@pytest.fixture()
def teacher_token(client, seed_users_extended):
    return _get_token(client, "teacher@test.edu")


@pytest.fixture()
def student_token(client, seed_users_extended):
    return _get_token(client, "student@test.edu")


@pytest.fixture()
def seed_academic_data(db: Session):
    """
    Pre-seed a ClassRoom and Subject row so that timetable and other
    tests that hit /admin/classes and /admin/subjects find data.
    """
    from app.models.academic import ClassRoom, Subject

    cls = ClassRoom(
        name="Class-10A",
        grade_level=10,
        section="A",
        capacity=40,
        room_number="R1",
    )
    subj = Subject(name="Mathematics", code="MATH-10")
    db.add_all([cls, subj])
    db.flush()
    return {"classroom": cls, "subject": subj}
