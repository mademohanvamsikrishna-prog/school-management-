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
    db.add_all([p_students_read, p_marks_write])
    db.flush()

    # --- Roles ---
    admin_role = Role(
        name="admin",
        description="Administrator",
        permissions=[p_students_read, p_marks_write],
    )
    teacher_role = Role(
        name="teacher",
        description="Teacher",
        permissions=[p_students_read, p_marks_write],
    )
    student_role = Role(
        name="student",
        description="Student",
        permissions=[p_students_read],
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
