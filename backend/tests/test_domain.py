"""
Domain API tests — attendance, marks, finance, events, profile, dashboard.
Extends the existing conftest fixtures (seed_users, client, db).
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.academic import ClassRoom, Subject, ClassSubject, StudentEnrollment
from app.models.marks import Exam, ExamSubject
from app.models.finance import FeeCategory, FeeInvoice
from app.models.communication import Event
from app.core.security import get_password_hash

LOGIN_URL = "/api/v1/auth/login"


# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

def login_as(client, email, password="testpass123"):
    r = client.post(LOGIN_URL, json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture()
def classroom(db: Session):
    cls = ClassRoom(name="Test-10A", grade_level=10, section="A", capacity=40, room_number="R1")
    db.add(cls)
    db.flush()
    return cls


@pytest.fixture()
def subject(db: Session):
    subj = Subject(name="Mathematics", code="MATH-10")
    db.add(subj)
    db.flush()
    return subj


@pytest.fixture()
def exam(db: Session, classroom, subject):
    e = Exam(name="Mid-Term 1", term="Term 1", start_date="2026-09-10",
             end_date="2026-09-15", status="upcoming")
    db.add(e)
    db.flush()
    es = ExamSubject(
        exam_id=e.id, class_id=classroom.id, subject_id=subject.id,
        max_marks=100.0, passing_marks=35.0, exam_date="2026-09-10"
    )
    db.add(es)
    db.flush()
    return e, es


@pytest.fixture()
def enrolled_student(db: Session, seed_users, classroom):
    student = seed_users["student"]
    enrollment = StudentEnrollment(
        student_id=student.id, class_id=classroom.id,
        academic_year="2026-2027", roll_number="001"
    )
    db.add(enrollment)
    db.flush()
    return student


@pytest.fixture()
def fee_invoice(db: Session, seed_users):
    student = seed_users["student"]
    inv = FeeInvoice(student_id=student.id, title="Tuition Fee Q1",
                     amount=5000.0, due_date="2026-09-30", status="pending")
    db.add(inv)
    db.flush()
    return inv


@pytest.fixture()
def event_row(db: Session):
    e = Event(title="Annual Day", description="School annual day celebration",
              date="2026-12-15", time="10:00 AM", location="School Auditorium",
              type="cultural", target_audience="all")
    db.add(e)
    db.flush()
    return e


# ---------------------------------------------------------------------------
# 1. Attendance — summary for student
# ---------------------------------------------------------------------------

def test_attendance_summary(client: TestClient, seed_users, classroom):
    token = login_as(client, "admin@test.edu")
    student = seed_users["student"]
    r = client.get(
        f"/api/v1/attendance/student/{student.id}/summary",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert "percentage" in body
    assert "present_days" in body


# ---------------------------------------------------------------------------
# 2. Attendance — permission denied for student trying to mark
# ---------------------------------------------------------------------------

def test_mark_attendance_permission_denied(client: TestClient, seed_users, classroom):
    token = login_as(client, "student@test.edu")
    student = seed_users["student"]
    r = client.post(
        f"/api/v1/attendance/class/{classroom.id}/mark",
        json={"class_id": classroom.id, "date": "2026-09-04",
              "records": [{"student_id": student.id, "status": "present"}]},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403


# ---------------------------------------------------------------------------
# 3. Attendance — teacher can mark
# ---------------------------------------------------------------------------

def test_mark_attendance_teacher(client: TestClient, seed_users, classroom):
    token = login_as(client, "teacher@test.edu")
    student = seed_users["student"]
    r = client.post(
        f"/api/v1/attendance/class/{classroom.id}/mark",
        json={"class_id": classroom.id, "date": "2026-09-04",
              "records": [{"student_id": student.id, "status": "present"}]},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["marked"] == 1


# ---------------------------------------------------------------------------
# 4. Marks — list exams (teacher)
# ---------------------------------------------------------------------------

def test_list_exams_teacher(client: TestClient, seed_users, exam):
    token = login_as(client, "teacher@test.edu")
    r = client.get("/api/v1/marks/exams", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------------------------------------------------------------------------
# 5. Marks — enter mark (teacher) → success
# ---------------------------------------------------------------------------

def test_enter_mark_teacher(client: TestClient, seed_users, exam, enrolled_student):
    token = login_as(client, "teacher@test.edu")
    _, exam_subject = exam
    student = enrolled_student
    r = client.post(
        "/api/v1/marks/enter",
        json={"exam_subject_id": exam_subject.id, "student_id": student.id,
              "marks_obtained": 75.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["marks_obtained"] == 75.0
    assert body["grade"] == "B+"


# ---------------------------------------------------------------------------
# 6. Marks — student cannot enter marks
# ---------------------------------------------------------------------------

def test_enter_mark_student_denied(client: TestClient, seed_users, exam):
    token = login_as(client, "student@test.edu")
    _, exam_subject = exam
    student = seed_users["student"]
    r = client.post(
        "/api/v1/marks/enter",
        json={"exam_subject_id": exam_subject.id, "student_id": student.id,
              "marks_obtained": 80.0},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403


# ---------------------------------------------------------------------------
# 7. Finance — get invoices
# ---------------------------------------------------------------------------

def test_get_student_invoices(client: TestClient, seed_users, fee_invoice):
    token = login_as(client, "admin@test.edu")
    student = seed_users["student"]
    r = client.get(
        f"/api/v1/finance/student/{student.id}/invoices",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert any(inv["title"] == "Tuition Fee Q1" for inv in data)


# ---------------------------------------------------------------------------
# 8. Events — get events list
# ---------------------------------------------------------------------------

def test_list_events(client: TestClient, seed_users, event_row):
    token = login_as(client, "student@test.edu")
    r = client.get("/api/v1/events", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------------------------------------------------------------------------
# 9. Profile — get my profile
# ---------------------------------------------------------------------------

def test_get_profile(client: TestClient, seed_users):
    token = login_as(client, "teacher@test.edu")
    r = client.get("/api/v1/profile/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == "teacher@test.edu"
    assert body["role"] == "teacher"
    assert "hashed_password" not in str(body)


# ---------------------------------------------------------------------------
# 10. Dashboard — student summary
# ---------------------------------------------------------------------------

def test_dashboard_student(client: TestClient, seed_users):
    token = login_as(client, "student@test.edu")
    r = client.get("/api/v1/dashboard/summary", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    body = r.json()
    assert body["role"] == "student"
    assert "attendance_percentage" in body


# ---------------------------------------------------------------------------
# 11. Dashboard — teacher summary
# ---------------------------------------------------------------------------

def test_dashboard_teacher(client: TestClient, seed_users):
    token = login_as(client, "teacher@test.edu")
    r = client.get("/api/v1/dashboard/summary", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    body = r.json()
    assert body["role"] == "teacher"
    assert "total_classes" in body
