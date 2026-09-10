"""
test_ownership.py — Record-level ownership authorization tests.

Tests the _assert_student_access() rules for the five student-scoped endpoints:
  - GET /attendance/student/{id}/summary
  - GET /attendance/student/{id}/records
  - GET /attendance/student/{id}/history
  - GET /marks/student/{id}
  - GET /finance/student/{id}/invoices

Roles tested: admin (allowed all), student (own OK, other denied),
              parent (linked child OK, unlinked denied), teacher (always denied).
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User, Role, Permission, parent_students, StudentProfile
from app.models.finance import FeeCategory, FeeInvoice

LOGIN_URL = "/api/v1/auth/login"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def ownership_seed(db: Session):
    """
    Creates:
      admin, teacher, student_a (target), student_b (another student),
      parent_of_a (linked to student_a only).
    Returns them as a dict.
    """
    hashed = get_password_hash("testpass123")

    # Permissions
    perms_data = [
        ("attendance:read", "View Attendance", "attendance"),
        ("attendance:mark", "Mark Attendance", "attendance"),
        ("marks:read", "View Marks", "marks"),
        ("marks:write", "Enter Marks", "marks"),
        ("finance:read", "View Finance", "finance"),
        ("finance:pay_mock", "Simulate Payment", "finance"),
        ("timetable:read", "View Timetable", "timetable"),
        ("students:read", "View Students", "students"),
    ]
    perms = {}
    for code, name, module in perms_data:
        p = Permission(code=code, name=name, description="", module=module)
        db.add(p)
        perms[code] = p
    db.flush()

    # Roles
    admin_role = Role(
        name="admin",
        description="Administrator",
        permissions=list(perms.values()),
    )
    teacher_role = Role(
        name="teacher",
        description="Teacher",
        permissions=[
            perms["attendance:read"], perms["attendance:mark"],
            perms["marks:read"], perms["marks:write"], perms["timetable:read"],
            perms["students:read"],
        ],
    )
    student_role = Role(
        name="student",
        description="Student",
        permissions=[
            perms["attendance:read"], perms["marks:read"],
            perms["finance:read"], perms["finance:pay_mock"],
            perms["timetable:read"], perms["students:read"],
        ],
    )
    parent_role = Role(
        name="parent",
        description="Parent",
        permissions=[
            perms["attendance:read"], perms["marks:read"],
            perms["finance:read"], perms["finance:pay_mock"],
            perms["students:read"],
        ],
    )
    db.add_all([admin_role, teacher_role, student_role, parent_role])
    db.flush()

    # Users
    admin = User(email="own_admin@test.edu", hashed_password=hashed,
                 name="Admin User", role_id=admin_role.id)
    teacher = User(email="own_teacher@test.edu", hashed_password=hashed,
                   name="Teacher User", role_id=teacher_role.id)
    student_a = User(email="own_student_a@test.edu", hashed_password=hashed,
                     name="Student A", role_id=student_role.id)
    student_a.student_profile = StudentProfile(
        roll_number="OWN-001", admission_number="OWN-ADM-001", section="A"
    )
    student_b = User(email="own_student_b@test.edu", hashed_password=hashed,
                     name="Student B", role_id=student_role.id)
    student_b.student_profile = StudentProfile(
        roll_number="OWN-002", admission_number="OWN-ADM-002", section="B"
    )
    parent_a = User(email="own_parent_a@test.edu", hashed_password=hashed,
                    name="Parent of A", role_id=parent_role.id)

    db.add_all([admin, teacher, student_a, student_b, parent_a])
    db.flush()

    # Link parent_a -> student_a
    db.execute(
        parent_students.insert().values(
            parent_id=parent_a.id, student_id=student_a.id, relationship_type="guardian"
        )
    )
    db.commit()

    return {
        "admin": admin,
        "teacher": teacher,
        "student_a": student_a,
        "student_b": student_b,
        "parent_a": parent_a,
    }


def _login(client: TestClient, email: str) -> str:
    r = client.post(LOGIN_URL, json={"email": email, "password": "testpass123"})
    assert r.status_code == 200, f"Login failed for {email}: {r.text}"
    return r.json()["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Attendance summary
# ---------------------------------------------------------------------------

class TestAttendanceSummaryOwnership:
    ENDPOINT = "/api/v1/attendance/student/{sid}/summary"

    def test_admin_can_access_any_student(self, client, ownership_seed):
        token = _login(client, "own_admin@test.edu")
        sid = ownership_seed["student_a"].id
        r = client.get(self.ENDPOINT.format(sid=sid), headers=_auth(token))
        assert r.status_code == 200

    def test_student_can_access_own(self, client, ownership_seed):
        token = _login(client, "own_student_a@test.edu")
        sid = ownership_seed["student_a"].id
        r = client.get(self.ENDPOINT.format(sid=sid), headers=_auth(token))
        assert r.status_code == 200

    def test_student_denied_other_student(self, client, ownership_seed):
        token = _login(client, "own_student_a@test.edu")
        sid = ownership_seed["student_b"].id  # different student
        r = client.get(self.ENDPOINT.format(sid=sid), headers=_auth(token))
        assert r.status_code == 403
        assert "own records" in r.json()["detail"].lower()

    def test_parent_can_access_linked_child(self, client, ownership_seed):
        token = _login(client, "own_parent_a@test.edu")
        sid = ownership_seed["student_a"].id  # parent_a's child
        r = client.get(self.ENDPOINT.format(sid=sid), headers=_auth(token))
        assert r.status_code == 200

    def test_parent_denied_unlinked_student(self, client, ownership_seed):
        token = _login(client, "own_parent_a@test.edu")
        sid = ownership_seed["student_b"].id  # NOT parent_a's child
        r = client.get(self.ENDPOINT.format(sid=sid), headers=_auth(token))
        assert r.status_code == 403
        assert "linked children" in r.json()["detail"].lower()

    def test_teacher_denied(self, client, ownership_seed):
        token = _login(client, "own_teacher@test.edu")
        sid = ownership_seed["student_a"].id
        r = client.get(self.ENDPOINT.format(sid=sid), headers=_auth(token))
        assert r.status_code == 403
        assert "Teachers are not permitted" in r.json()["detail"]


# ---------------------------------------------------------------------------
# Attendance records
# ---------------------------------------------------------------------------

class TestAttendanceRecordsOwnership:
    ENDPOINT = "/api/v1/attendance/student/{sid}/records"

    def test_admin_allowed(self, client, ownership_seed):
        token = _login(client, "own_admin@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 200

    def test_student_own_allowed(self, client, ownership_seed):
        token = _login(client, "own_student_a@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 200

    def test_student_other_denied(self, client, ownership_seed):
        token = _login(client, "own_student_a@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_b"].id),
                       headers=_auth(token))
        assert r.status_code == 403

    def test_parent_child_allowed(self, client, ownership_seed):
        token = _login(client, "own_parent_a@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 200

    def test_parent_other_denied(self, client, ownership_seed):
        token = _login(client, "own_parent_a@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_b"].id),
                       headers=_auth(token))
        assert r.status_code == 403

    def test_teacher_denied(self, client, ownership_seed):
        token = _login(client, "own_teacher@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 403


# ---------------------------------------------------------------------------
# Attendance history
# ---------------------------------------------------------------------------

class TestAttendanceHistoryOwnership:
    ENDPOINT = "/api/v1/attendance/student/{sid}/history"

    def test_admin_allowed(self, client, ownership_seed):
        token = _login(client, "own_admin@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 200

    def test_student_own_allowed(self, client, ownership_seed):
        token = _login(client, "own_student_a@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 200

    def test_student_other_denied(self, client, ownership_seed):
        token = _login(client, "own_student_a@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_b"].id),
                       headers=_auth(token))
        assert r.status_code == 403

    def test_parent_child_allowed(self, client, ownership_seed):
        token = _login(client, "own_parent_a@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 200

    def test_parent_other_denied(self, client, ownership_seed):
        token = _login(client, "own_parent_a@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_b"].id),
                       headers=_auth(token))
        assert r.status_code == 403

    def test_teacher_denied(self, client, ownership_seed):
        token = _login(client, "own_teacher@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 403


# ---------------------------------------------------------------------------
# Student marks
# ---------------------------------------------------------------------------

class TestStudentMarksOwnership:
    ENDPOINT = "/api/v1/marks/student/{sid}"

    def test_admin_allowed(self, client, ownership_seed):
        token = _login(client, "own_admin@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 200

    def test_student_own_allowed(self, client, ownership_seed):
        token = _login(client, "own_student_a@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 200

    def test_student_other_denied(self, client, ownership_seed):
        token = _login(client, "own_student_a@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_b"].id),
                       headers=_auth(token))
        assert r.status_code == 403

    def test_parent_child_allowed(self, client, ownership_seed):
        token = _login(client, "own_parent_a@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 200

    def test_parent_other_denied(self, client, ownership_seed):
        token = _login(client, "own_parent_a@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_b"].id),
                       headers=_auth(token))
        assert r.status_code == 403

    def test_teacher_denied(self, client, ownership_seed):
        token = _login(client, "own_teacher@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 403


# ---------------------------------------------------------------------------
# Fee invoices
# ---------------------------------------------------------------------------

@pytest.fixture()
def invoice_for_student_a(db: Session, ownership_seed):
    """Create a fee invoice belonging to student_a."""
    student_a = ownership_seed["student_a"]
    inv = FeeInvoice(
        student_id=student_a.id,
        title="Term Fee",
        amount=3000.0,
        due_date="2026-12-31",
        status="pending",
    )
    db.add(inv)
    db.flush()
    return inv


class TestStudentInvoicesOwnership:
    ENDPOINT = "/api/v1/finance/student/{sid}/invoices"

    def test_admin_allowed(self, client, ownership_seed, invoice_for_student_a):
        token = _login(client, "own_admin@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 200
        assert any(inv["title"] == "Term Fee" for inv in r.json())

    def test_student_own_allowed(self, client, ownership_seed, invoice_for_student_a):
        token = _login(client, "own_student_a@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 200

    def test_student_other_denied(self, client, ownership_seed, invoice_for_student_a):
        # student_b tries to read student_a's invoices
        token = _login(client, "own_student_b@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 403

    def test_parent_child_allowed(self, client, ownership_seed, invoice_for_student_a):
        token = _login(client, "own_parent_a@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 200

    def test_parent_other_denied(self, client, ownership_seed, invoice_for_student_a):
        token = _login(client, "own_parent_a@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_b"].id),
                       headers=_auth(token))
        assert r.status_code == 403

    def test_teacher_denied(self, client, ownership_seed, invoice_for_student_a):
        token = _login(client, "own_teacher@test.edu")
        r = client.get(self.ENDPOINT.format(sid=ownership_seed["student_a"].id),
                       headers=_auth(token))
        assert r.status_code == 403
