"""
Tests for admin endpoints and extended modules (food, transport, library, leave, chat).
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.user import User
from app.models.academic import ClassRoom, Subject
from app.models.communication import Conversation


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _login(client, email: str, password: str) -> str:
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["access_token"]


# ---------------------------------------------------------------------------
# Admin: user management
# ---------------------------------------------------------------------------

class TestAdminUserManagement:
    def test_list_users_as_admin(self, client, admin_token):
        resp = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
        assert len(resp.json()) > 0

    def test_list_users_as_student_denied(self, client, student_token):
        resp = client.get("/api/v1/admin/users", headers={"Authorization": f"Bearer {student_token}"})
        assert resp.status_code == 403

    def test_list_users_unauthenticated(self, client):
        resp = client.get("/api/v1/admin/users")
        assert resp.status_code == 401

    def test_update_user_name(self, client, admin_token, db_session):
        # Get a student ID
        resp = client.get(
            "/api/v1/admin/users?role_name=student",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 200
        students = resp.json()
        if not students:
            pytest.skip("No student users in test DB")
        student_id = students[0]["id"]
        original_name = students[0]["name"]

        # Update name
        resp = client.patch(
            f"/api/v1/admin/users/{student_id}",
            json={"name": "Updated Test Name"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Test Name"

        # Restore
        client.patch(
            f"/api/v1/admin/users/{student_id}",
            json={"name": original_name},
            headers={"Authorization": f"Bearer {admin_token}"}
        )

    def test_list_roles(self, client, admin_token):
        resp = client.get("/api/v1/admin/roles", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        role_names = [r["name"] for r in resp.json()]
        assert "admin" in role_names or "teacher" in role_names  # at least some roles exist


# ---------------------------------------------------------------------------
# Admin: classes and subjects
# ---------------------------------------------------------------------------

class TestAdminAcademic:
    def test_list_classes(self, client, admin_token):
        resp = client.get("/api/v1/admin/classes", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_create_class(self, client, admin_token):
        resp = client.post(
            "/api/v1/admin/classes",
            json={"name": "Test Class 99Z", "grade_level": 9, "section": "Z", "capacity": 30},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Test Class 99Z"
        assert data["grade_level"] == 9

    def test_list_subjects(self, client, admin_token):
        resp = client.get("/api/v1/admin/subjects", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


# ---------------------------------------------------------------------------
# Extended: Food Court
# ---------------------------------------------------------------------------

class TestFoodCourt:
    def test_browse_menu_authenticated(self, client, student_token):
        resp = client.get("/api/v1/food/menu", headers={"Authorization": f"Bearer {student_token}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_browse_menu_unauthenticated(self, client):
        resp = client.get("/api/v1/food/menu")
        assert resp.status_code == 401

    def test_my_orders_empty(self, client, student_token):
        resp = client.get("/api/v1/food/orders/mine", headers={"Authorization": f"Bearer {student_token}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


# ---------------------------------------------------------------------------
# Extended: Transport
# ---------------------------------------------------------------------------

class TestTransport:
    def test_list_routes(self, client, student_token):
        resp = client.get("/api/v1/transport/routes", headers={"Authorization": f"Bearer {student_token}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_my_assignment_no_data(self, client, student_token):
        resp = client.get("/api/v1/transport/my-assignment", headers={"Authorization": f"Bearer {student_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "assigned" in data


# ---------------------------------------------------------------------------
# Extended: Library
# ---------------------------------------------------------------------------

class TestLibrary:
    def test_browse_books(self, client, student_token):
        resp = client.get("/api/v1/library/books", headers={"Authorization": f"Bearer {student_token}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_my_issues(self, client, student_token):
        resp = client.get("/api/v1/library/issues/mine", headers={"Authorization": f"Bearer {student_token}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


# ---------------------------------------------------------------------------
# Extended: Leave
# ---------------------------------------------------------------------------

class TestLeave:
    def test_leave_types(self, client, teacher_token):
        resp = client.get("/api/v1/leave/types", headers={"Authorization": f"Bearer {teacher_token}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_my_leave_requests(self, client, teacher_token):
        resp = client.get("/api/v1/leave/requests/mine", headers={"Authorization": f"Bearer {teacher_token}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


# ---------------------------------------------------------------------------
# Extended: Chat
# ---------------------------------------------------------------------------

class TestChat:
    def test_my_conversations(self, client, student_token):
        resp = client.get("/api/v1/chat/conversations", headers={"Authorization": f"Bearer {student_token}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_create_conversation_invalid_participant(self, client, student_token):
        resp = client.post(
            "/api/v1/chat/conversations",
            json={"participant_ids": ["nonexistent-id"], "type": "direct"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        # Should fail - not enough valid participants
        assert resp.status_code in [400, 404]

    def test_create_conversation_valid(self, client, student_token, teacher_token, db_session):
        # Get teacher user ID via /auth/me
        me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {teacher_token}"})
        assert me_resp.status_code == 200
        teacher_id = me_resp.json()["id"]

        resp = client.post(
            "/api/v1/chat/conversations",
            json={"participant_ids": [teacher_id], "type": "direct"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert resp.status_code == 201
        conv_id = resp.json()["id"]

        # Send a message
        msg_resp = client.post(
            f"/api/v1/chat/conversations/{conv_id}/messages",
            json={"content": "Hello teacher!"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert msg_resp.status_code == 201
        assert msg_resp.json()["content"] == "Hello teacher!"

        # Get messages
        get_resp = client.get(
            f"/api/v1/chat/conversations/{conv_id}/messages",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert get_resp.status_code == 200
        assert len(get_resp.json()) >= 1

    def test_send_empty_message_rejected(self, client, student_token, teacher_token, db_session):
        me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {teacher_token}"})
        teacher_id = me_resp.json()["id"]
        conv_resp = client.post(
            "/api/v1/chat/conversations",
            json={"participant_ids": [teacher_id], "type": "direct"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        conv_id = conv_resp.json()["id"]
        resp = client.post(
            f"/api/v1/chat/conversations/{conv_id}/messages",
            json={"content": "   "},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------

class TestAnalytics:
    def test_overview_as_admin(self, client, admin_token):
        resp = client.get("/api/v1/analytics/overview", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "enrollment" in data
        assert "attendance" in data
        assert "finance" in data

    def test_overview_as_student_denied(self, client, student_token):
        resp = client.get("/api/v1/analytics/overview", headers={"Authorization": f"Bearer {student_token}"})
        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Domain: Events management
# ---------------------------------------------------------------------------

class TestEventManagement:
    def test_create_event_admin(self, client, admin_token):
        resp = client.post(
            "/api/v1/events",
            json={"title": "Test Science Fair", "description": "Annual fair", "date": "2026-12-01",
                  "time": "10:00 AM", "location": "School Hall", "type": "academic"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 201
        assert resp.json()["title"] == "Test Science Fair"

    def test_create_event_student_denied(self, client, student_token):
        resp = client.post(
            "/api/v1/events",
            json={"title": "Hack", "description": "x", "date": "2026-12-01", "time": "10am", "location": "here"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert resp.status_code == 403

    def test_notification_mark_as_read(self, client, student_token):
        # Should not error even if notification doesn't exist for this user
        # Mark a non-existent notification - expect graceful handling
        resp = client.post(
            "/api/v1/notifications/nonexistent-id/read",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert resp.status_code == 200
        assert resp.json()["read"] == False  # not found = not marked


# ---------------------------------------------------------------------------
# Timetable management
# ---------------------------------------------------------------------------

class TestTimetableManagement:
    def test_create_timetable_entry(self, client, admin_token, db_session, seed_academic_data):
        # Need class, subject, and teacher IDs
        classes = client.get("/api/v1/admin/classes", headers={"Authorization": f"Bearer {admin_token}"}).json()
        subjects = client.get("/api/v1/admin/subjects", headers={"Authorization": f"Bearer {admin_token}"}).json()
        teachers = client.get(
            "/api/v1/admin/users?role_name=teacher",
            headers={"Authorization": f"Bearer {admin_token}"}
        ).json()

        if not classes or not subjects or not teachers:
            pytest.skip("Insufficient seed data for timetable test")

        resp = client.post(
            "/api/v1/timetable",
            json={
                "class_id": classes[0]["id"],
                "subject_id": subjects[0]["id"],
                "teacher_id": teachers[0]["id"],
                "day_of_week": 3,
                "start_time": "11:00",
                "end_time": "12:00",
                "room_number": "TestRoom99",
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 201

        # Conflict detection: same teacher, same slot
        resp2 = client.post(
            "/api/v1/timetable",
            json={
                "class_id": classes[0]["id"] if len(classes) == 1 else classes[1]["id"],
                "subject_id": subjects[0]["id"],
                "teacher_id": teachers[0]["id"],  # same teacher!
                "day_of_week": 3,
                "start_time": "11:00",
                "end_time": "12:00",
                "room_number": "TestRoom99",
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp2.status_code == 409  # conflict
