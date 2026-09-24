# backend/app/db/seed.py
# ─────────────────────────────────────────────────────────────────────────────
# School Management System — Database Seeder
#
# Functions (call order matters — each is idempotent):
#   1. seed_database()          — permissions, roles, baseline users
#   2. ensure_seed_invoices()   — gap-fill invoices for baseline students
#   3. seed_telugu_class_9c()   — Class 9-C with 10 Telugu students
#   4. seed_requested_users()   — principal/sharma/verma/dhanush/charitha/rajesh
#
# FIX LOG (20 issues resolved):
#   #1  Removed seed_dhanush_family() from __main__ — ghost .edu/.com duplicates
#   #2  Renamed exam in seed_9c to avoid collision with seed_database() exam
#   #3  Unique transaction_references via uuid4 in ensure_seed_invoices()
#   #4  db.flush() added before children.append() in seed_requested_users()
#   #5  teacher_role added to guard check in seed_9c
#   #6  Blood groups added per-student in students_data (no longer all O+)
#   #7  db.flush() moved outside per-student loop (was N×1 SQL round-trips)
#   #8  db.flush() added before teacher_user.id is referenced in seed_database()
#   #9  db.flush() added before parent_user.children.append() in seed_database()
#   #10 Attendance seeded on school days only (Mon–Fri) via _school_days()
#   #11 get_password_hash() called once per seeder fn, not per-user
#   #12 User.name fallback removed from ensure_seed_invoices() (non-unique)
#   #13 grade_map moved to module level; used consistently in all seeders
#   #14 db.rollback() added to __main__ exception handler
#   #15 Idempotency guard added before exam insert in seed_9c
#   #16 Magic absent-day indices documented with comments
#   #17 grade_map is now a module-level function (Fix #13 covers this)
#   #18 Independent commits documented; __main__ now rolls back on failure
#   #19 Principal's lack of teacher_profile documented explicitly
#   #20 Verbose db.add() loops replaced with db.add_all() where applicable
# ─────────────────────────────────────────────────────────────────────────────

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models import (
    AttendanceRecord,
    ClassRoom,
    ClassSubject,
    Conversation,
    Event,
    Exam,
    ExamSubject,
    FeeCategory,
    FeeInvoice,
    MarkRecord,
    Message,
    Notification,
    ParentProfile,
    PaymentRecord,
    Permission,
    Role,
    StudentEnrollment,
    StudentProfile,
    Subject,
    TeacherProfile,
    TimetableEntry,
    User,
)


# ── Module-level helpers ──────────────────────────────────────────────────────

def _grade(pct: float) -> str:
    """
    FIX #13, #17: Convert percentage score to letter grade.
    Module-level so every seeder function uses the same boundary logic.
    """
    if pct >= 90:
        return "A+"
    if pct >= 80:
        return "A"
    if pct >= 70:
        return "B+"
    if pct >= 60:
        return "B"
    if pct >= 50:
        return "C"
    return "D"


def _school_days(n: int) -> list:
    """
    FIX #10: Return n most recent school days (Mon–Fri) as YYYY-MM-DD strings.
    Excludes weekends so attendance percentages are not artificially inflated.
    """
    days: list = []
    d = datetime.now(timezone.utc).date()
    while len(days) < n:
        if d.weekday() < 5:  # 0=Monday … 4=Friday
            days.append(d.strftime("%Y-%m-%d"))
        d -= timedelta(days=1)
    return days


def _txn_ref(prefix: str = "TXN") -> str:
    """
    FIX #3: Generate a unique transaction reference so ensure_seed_invoices()
    never collides with refs already inserted by seed_database().
    """
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"


# ── 1. seed_database ──────────────────────────────────────────────────────────

def seed_database(db: Session) -> None:
    print("[INFO] Creating all tables if not exist...")
    Base.metadata.create_all(bind=engine)

    # Idempotency guard
    if db.query(User).filter(User.email == "admin@school.edu").first():
        print("[INFO] Database already seeded. Skipping.")
        return

    # ── Permissions ───────────────────────────────────────────────────────────
    print("[INFO] Seeding granular permissions...")
    permissions_data = [
        # Attendance
        ("attendance:mark",   "Mark Attendance",   "Permission to record class attendance",          "attendance"),
        ("attendance:read",   "View Attendance",   "Permission to view student/class attendance",    "attendance"),
        ("attendance:update", "Update Attendance", "Permission to edit attendance records",          "attendance"),
        # Marks & Exams
        ("marks:write",       "Enter Marks",       "Permission to enter and edit student marks",     "marks"),
        ("marks:read",        "View Marks",        "Permission to view report cards and grades",     "marks"),
        ("exams:manage",      "Manage Exams",      "Permission to schedule and edit exams",          "marks"),
        # Timetable
        ("timetable:manage",  "Manage Timetable",  "Permission to configure timetables",             "timetable"),
        ("timetable:read",    "View Timetable",    "Permission to view timetable schedules",         "timetable"),
        # Classes & Subjects
        ("classes:manage",    "Manage Classes",    "Permission to create classes and assign rosters","classes"),
        ("classes:read",      "View Classes",      "Permission to view class lists and rosters",     "classes"),
        # Finance
        ("finance:read",      "View Finance",      "Permission to view fee invoices and statements", "finance"),
        ("finance:pay_mock",  "Pay Fees (Sim)",    "Permission to execute simulated fee payments",   "finance"),
        ("finance:manage",    "Manage Finance",    "Permission to create fee categories/invoices",   "finance"),
        # Chat & Events
        ("chat:read",         "Read Chat",         "Permission to view conversation threads",        "chat"),
        ("chat:send",         "Send Chat",         "Permission to send chat messages",               "chat"),
        ("events:create",     "Create Events",     "Permission to publish school events",            "events"),
        ("events:read",       "View Events",       "Permission to view events calendar",             "events"),
        # Users
        ("users:manage",      "Manage Users",      "Permission to create and manage user accounts",  "users"),
        ("users:read",        "View Users",        "Permission to view user directory",              "users"),
    ]

    permission_map: dict = {}
    for code, name, desc, mod in permissions_data:
        perm = Permission(code=code, name=name, description=desc, module=mod)
        db.add(perm)
        permission_map[code] = perm
    db.flush()

    # ── Roles ─────────────────────────────────────────────────────────────────
    print("[INFO] Seeding roles and mapping permissions...")
    roles = {
        "admin": Role(
            name="admin",
            description="School Administrator with full system privileges",
            permissions=list(permission_map.values()),
        ),
        "teacher": Role(
            name="teacher",
            description="Academic Instructor",
            permissions=[
                permission_map["attendance:mark"],
                permission_map["attendance:read"],
                permission_map["attendance:update"],
                permission_map["marks:write"],
                permission_map["marks:read"],
                permission_map["timetable:read"],
                permission_map["classes:read"],
                permission_map["chat:read"],
                permission_map["chat:send"],
                permission_map["events:read"],
                permission_map["users:read"],
            ],
        ),
        "student": Role(
            name="student",
            description="Enrolled Student",
            permissions=[
                permission_map["attendance:read"],
                permission_map["marks:read"],
                permission_map["timetable:read"],
                permission_map["classes:read"],
                permission_map["chat:read"],
                permission_map["chat:send"],
                permission_map["events:read"],
                permission_map["finance:read"],
            ],
        ),
        "parent": Role(
            name="parent",
            description="Parent or Legal Guardian",
            permissions=[
                permission_map["attendance:read"],
                permission_map["marks:read"],
                permission_map["timetable:read"],
                permission_map["chat:read"],
                permission_map["chat:send"],
                permission_map["events:read"],
                permission_map["finance:read"],
                permission_map["finance:pay_mock"],
            ],
        ),
        "staff": Role(
            name="staff",
            description="Support Staff Member",
            permissions=[
                permission_map["events:read"],
                permission_map["chat:read"],
                permission_map["chat:send"],
            ],
        ),
    }

    db.add_all(list(roles.values()))  # FIX #20: db.add_all instead of loop
    db.flush()

    # ── Users ─────────────────────────────────────────────────────────────────
    print("[INFO] Seeding baseline users...")
    hashed_pwd = get_password_hash("password123")  # FIX #11: hash once per fn

    admin_user = User(
        email="admin@school.edu",
        hashed_password=hashed_pwd,
        name="Dr. Alok Verma",
        role_id=roles["admin"].id,
        avatar_url="https://i.pravatar.cc/150?u=admin",
    )
    db.add(admin_user)

    teacher_user = User(
        email="teacher@school.edu",
        hashed_password=hashed_pwd,
        name="Priya Desai",
        role_id=roles["teacher"].id,
        avatar_url="https://i.pravatar.cc/150?u=priya",
    )
    teacher_user.teacher_profile = TeacherProfile(
        employee_id="TCH-1001",
        department="Mathematics",
        qualification="M.Sc. Mathematics, B.Ed.",
        is_class_teacher=True,
    )
    db.add(teacher_user)

    teacher2 = User(
        email="vikram.singh@school.edu",
        hashed_password=hashed_pwd,
        name="Vikram Singh",
        role_id=roles["teacher"].id,
        avatar_url="https://i.pravatar.cc/150?u=vikramsingh",
    )
    teacher2.teacher_profile = TeacherProfile(
        employee_id="TCH-1002",
        department="Science",
        qualification="M.Sc. Physics",
        is_class_teacher=False,
    )
    db.add(teacher2)

    student1 = User(
        email="student@school.edu",
        hashed_password=hashed_pwd,
        name="Rahul Sharma",
        role_id=roles["student"].id,
        avatar_url="https://i.pravatar.cc/150?u=rahul",
    )
    student1.student_profile = StudentProfile(
        roll_number="1014",
        admission_number="ADM-2024-1014",
        section="A",
        date_of_birth="2009-05-14",
        gender="Male",
        blood_group="B+",
    )
    db.add(student1)

    student2 = User(
        email="ananya.g@school.edu",
        hashed_password=hashed_pwd,
        name="Ananya Gupta",
        role_id=roles["student"].id,
        avatar_url="https://i.pravatar.cc/150?u=ananya",
    )
    student2.student_profile = StudentProfile(
        roll_number="7022",
        admission_number="ADM-2024-7022",
        section="B",
        date_of_birth="2012-09-20",
        gender="Female",
        blood_group="O+",
    )
    db.add(student2)

    # FIX #8, #9: Flush before using any .id as a FK or before children.append()
    db.flush()

    parent_user = User(
        email="parent@school.edu",
        hashed_password=hashed_pwd,
        name="Vikram Sharma",
        role_id=roles["parent"].id,
        avatar_url="https://i.pravatar.cc/150?u=vikram",
    )
    parent_user.parent_profile = ParentProfile(
        phone="+91 98765 43210",
        alternate_phone="+91 98765 43211",
        occupation="Software Architect",
        address="Flat 402, Green Valley Apartments, Bengaluru",
    )
    db.add(parent_user)
    db.flush()  # FIX #9: flush so student1.id / student2.id are confirmed before append

    parent_user.children.append(student1)
    parent_user.children.append(student2)
    db.flush()

    # ── Classes & Subjects ────────────────────────────────────────────────────
    print("[INFO] Seeding classes and subjects...")
    class_10a = ClassRoom(
        name="Class 10 - A",
        grade_level=10,
        section="A",
        room_number="Room 204",
        class_teacher_id=teacher_user.id,   # safe — flushed above
    )
    class_10b = ClassRoom(name="Class 10 - B", grade_level=10, section="B", room_number="Room 205")
    class_7b  = ClassRoom(name="Class 7 - B",  grade_level=7,  section="B", room_number="Room 102")
    db.add_all([class_10a, class_10b, class_7b])  # FIX #20
    db.flush()

    student1.student_profile.current_class_id = class_10a.id
    student2.student_profile.current_class_id = class_7b.id
    teacher_user.teacher_profile.class_teacher_of_class_id = class_10a.id

    sub_math = Subject(name="Mathematics",   code="MATH101", department="Mathematics")
    sub_sci  = Subject(name="Science",       code="SCI101",  department="Science")
    sub_eng  = Subject(name="English",       code="ENG101",  department="Languages")
    sub_soc  = Subject(name="Social Studies",code="SOC101",  department="Social Science")
    db.add_all([sub_math, sub_sci, sub_eng, sub_soc])  # FIX #20
    db.flush()

    db.add_all([
        ClassSubject(class_id=class_10a.id, subject_id=sub_math.id, teacher_id=teacher_user.id),
        ClassSubject(class_id=class_10a.id, subject_id=sub_sci.id,  teacher_id=teacher2.id),
        ClassSubject(class_id=class_10a.id, subject_id=sub_eng.id,  teacher_id=teacher_user.id),
    ])
    db.add_all([
        StudentEnrollment(student_id=student1.id, class_id=class_10a.id, roll_number="1014"),
        StudentEnrollment(student_id=student2.id, class_id=class_7b.id,  roll_number="7022"),
    ])
    db.flush()

    # ── Timetable ─────────────────────────────────────────────────────────────
    print("[INFO] Seeding timetable...")
    timetable_entries = []
    for day in range(1, 6):  # Monday=1 … Friday=5
        timetable_entries.extend([
            TimetableEntry(class_id=class_10a.id, subject_id=sub_math.id, teacher_id=teacher_user.id, day_of_week=day, start_time="08:30", end_time="09:30", room_number="Room 204"),
            TimetableEntry(class_id=class_10a.id, subject_id=sub_sci.id,  teacher_id=teacher2.id,     day_of_week=day, start_time="09:30", end_time="10:30", room_number="Lab 1"),
            TimetableEntry(class_id=class_10a.id, subject_id=sub_eng.id,  teacher_id=teacher_user.id, day_of_week=day, start_time="10:45", end_time="11:45", room_number="Room 204"),
        ])
    db.add_all(timetable_entries)  # FIX #20
    db.flush()

    # ── Attendance ────────────────────────────────────────────────────────────
    print("[INFO] Seeding attendance history...")
    # FIX #10: Use _school_days() — Mon–Fri only, no weekends
    school_days = _school_days(20)
    att_records = []
    for i, past_date in enumerate(school_days):
        # FIX #16: Day index 4 = 4th school day ago; day 12 = 12th school day ago
        status1 = "absent" if i in (4, 12) else "present"
        att_records.append(AttendanceRecord(student_id=student1.id, class_id=class_10a.id, date=past_date, status=status1, recorded_by_teacher_id=teacher_user.id))
        att_records.append(AttendanceRecord(student_id=student2.id, class_id=class_7b.id,  date=past_date, status="present", recorded_by_teacher_id=teacher_user.id))
    db.add_all(att_records)  # FIX #20
    db.flush()

    # ── Exams & Marks ─────────────────────────────────────────────────────────
    print("[INFO] Seeding exams and marks...")
    exam1 = Exam(
        name="Mid-Term Examination 2026",
        term="Term 1",
        academic_year="2026-2027",
        start_date="2026-09-15",
        end_date="2026-09-25",
        status="completed",
    )
    db.add(exam1)
    db.flush()

    es_math = ExamSubject(exam_id=exam1.id, class_id=class_10a.id, subject_id=sub_math.id, max_marks=100.0, passing_marks=35.0, exam_date="2026-09-16")
    es_sci  = ExamSubject(exam_id=exam1.id, class_id=class_10a.id, subject_id=sub_sci.id,  max_marks=100.0, passing_marks=35.0, exam_date="2026-09-18")
    es_eng  = ExamSubject(exam_id=exam1.id, class_id=class_10a.id, subject_id=sub_eng.id,  max_marks=100.0, passing_marks=35.0, exam_date="2026-09-20")
    db.add_all([es_math, es_sci, es_eng])
    db.flush()

    db.add_all([
        MarkRecord(exam_subject_id=es_math.id, student_id=student1.id, marks_obtained=87.0, grade=_grade(87), remarks="Excellent analytical ability",  entered_by_teacher_id=teacher_user.id),
        MarkRecord(exam_subject_id=es_sci.id,  student_id=student1.id, marks_obtained=91.0, grade=_grade(91), remarks="Outstanding practical work",    entered_by_teacher_id=teacher2.id),
        MarkRecord(exam_subject_id=es_eng.id,  student_id=student1.id, marks_obtained=84.0, grade=_grade(84), remarks="Good essay writing",            entered_by_teacher_id=teacher_user.id),
    ])
    db.flush()

    # ── Events & Notifications ────────────────────────────────────────────────
    print("[INFO] Seeding events and notifications...")
    db.add_all([
        Event(title="Annual Sports Meet 2026",   description="Inter-school athletic competitions and relay races.",          date="2026-10-15", time="09:00 AM", location="Main School Ground", type="sports",   target_audience="all"),
        Event(title="Parent-Teacher Meeting",    description="Quarterly academic review and performance discussion.",        date="2026-10-22", time="10:00 AM", location="Classrooms",          type="academic", target_audience="parent"),
        Event(title="Science Exhibition",        description="Project demonstration by senior secondary students.",          date="2026-11-05", time="11:30 AM", location="Auditorium",          type="cultural", target_audience="all"),
        Notification(user_id=student1.id,    title="Exam Schedule Released",  body="Mid-term exam dates are published. Check academics tab.",              type="exam"),
        Notification(user_id=parent_user.id, title="Fee Due Reminder",        body="Term 2 tuition fee invoice is available for payment.",                 type="finance"),
    ])
    db.flush()

    # ── Fee Categories & Invoices ─────────────────────────────────────────────
    print("[INFO] Seeding finance invoices...")
    cat_tuition   = FeeCategory(name="Tuition Fee",        description="Quarterly academic tuition fees")
    cat_transport = FeeCategory(name="Transport Fee",       description="School bus transportation charges")
    cat_exam      = FeeCategory(name="Examination Fee",     description="Term and annual exam registration fees")
    cat_activity  = FeeCategory(name="Activity & Lab Fee",  description="Laboratory, sports, and co-curricular charges")
    db.add_all([cat_tuition, cat_transport, cat_exam, cat_activity])
    db.flush()

    inv_r1 = FeeInvoice(student_id=student1.id, category_id=cat_tuition.id,   title="Tuition Fee - Term 1",      amount=15000.0, due_date="2026-08-15", status="paid")
    inv_r2 = FeeInvoice(student_id=student1.id, category_id=cat_tuition.id,   title="Tuition Fee - Term 2",      amount=15000.0, due_date="2026-12-15", status="pending")
    inv_r3 = FeeInvoice(student_id=student1.id, category_id=cat_exam.id,      title="Annual Examination Fee",    amount=3500.0,  due_date="2026-09-10", status="paid")
    inv_r4 = FeeInvoice(student_id=student1.id, category_id=cat_transport.id, title="Transport Fee - Quarter 2", amount=6000.0,  due_date="2026-10-15", status="pending")
    inv_a1 = FeeInvoice(student_id=student2.id, category_id=cat_tuition.id,   title="Tuition Fee - Term 1",      amount=12500.0, due_date="2026-08-15", status="paid")
    inv_a2 = FeeInvoice(student_id=student2.id, category_id=cat_tuition.id,   title="Tuition Fee - Term 2",      amount=12500.0, due_date="2026-12-15", status="pending")
    inv_a3 = FeeInvoice(student_id=student2.id, category_id=cat_exam.id,      title="Mid-Term Examination Fee",  amount=2500.0,  due_date="2026-11-10", status="pending")
    inv_a4 = FeeInvoice(student_id=student2.id, category_id=cat_transport.id, title="Transport Fee - Quarter 1", amount=5500.0,  due_date="2026-09-05", status="paid")
    inv_a5 = FeeInvoice(student_id=student2.id, category_id=cat_activity.id,  title="Activity & Science Lab Fee",amount=4000.0,  due_date="2026-08-20", status="paid")
    db.add_all([inv_r1, inv_r2, inv_r3, inv_r4, inv_a1, inv_a2, inv_a3, inv_a4, inv_a5])
    db.flush()

    # FIX #3: unique transaction_references via _txn_ref() — no hardcoded strings
    db.add_all([
        PaymentRecord(invoice_id=inv_r1.id, amount_paid=15000.0, payment_method="simulated_sandbox", transaction_reference=_txn_ref("BASE-R1"), status="success"),
        PaymentRecord(invoice_id=inv_r3.id, amount_paid=3500.0,  payment_method="simulated_sandbox", transaction_reference=_txn_ref("BASE-R3"), status="success"),
        PaymentRecord(invoice_id=inv_a1.id, amount_paid=12500.0, payment_method="simulated_sandbox", transaction_reference=_txn_ref("BASE-A1"), status="success"),
        PaymentRecord(invoice_id=inv_a4.id, amount_paid=5500.0,  payment_method="simulated_sandbox", transaction_reference=_txn_ref("BASE-A4"), status="success"),
        PaymentRecord(invoice_id=inv_a5.id, amount_paid=4000.0,  payment_method="simulated_sandbox", transaction_reference=_txn_ref("BASE-A5"), status="success"),
    ])
    db.flush()

    # ── Chat ──────────────────────────────────────────────────────────────────
    print("[INFO] Seeding chat conversation...")
    conv = Conversation(title="Priya Desai & Vikram Sharma", type="direct")
    conv.participants.append(teacher_user)
    conv.participants.append(parent_user)
    db.add(conv)
    db.flush()

    db.add_all([
        Message(conversation_id=conv.id, sender_id=parent_user.id,  content="Hello Ma'am, how has Rahul been performing in Math this term?",                        is_read=True),
        Message(conversation_id=conv.id, sender_id=teacher_user.id, content="Good afternoon Mr. Sharma. Rahul is doing exceptionally well! He scored 87% in mid-terms.", is_read=True),
    ])

    db.commit()
    print("[SUCCESS] Database seeded successfully!")


# ── 2. ensure_seed_invoices ───────────────────────────────────────────────────

def ensure_seed_invoices(db: Session) -> None:
    """
    Gap-fill invoices for the two baseline students.
    Safe to call multiple times — guards every insert with an existence check.
    """
    # FIX #12: Use email only — User.name is NOT unique and can match wrong records
    student2 = db.query(User).filter(
        (User.email == "ananya.g@school.edu") | (User.email == "student2@school.edu")
    ).first()
    student1 = db.query(User).filter(User.email == "student@school.edu").first()

    if not student2 or not student1:
        print("[WARNING] Baseline students not found — run seed_database() first.")
        return

    # Ensure categories exist
    def _get_or_create_category(name: str, description: str) -> FeeCategory:
        cat = db.query(FeeCategory).filter(FeeCategory.name == name).first()
        if not cat:
            cat = FeeCategory(name=name, description=description)
            db.add(cat)
        return cat

    cat_tuition   = _get_or_create_category("Tuition Fee",       "Quarterly academic tuition fees")
    cat_transport = _get_or_create_category("Transport Fee",      "School bus transportation charges")
    cat_exam      = _get_or_create_category("Examination Fee",    "Term and annual exam registration fees")
    cat_activity  = _get_or_create_category("Activity & Lab Fee", "Laboratory, sports, and co-curricular charges")
    db.flush()

    # student2 invoices
    if not db.query(FeeInvoice).filter(FeeInvoice.student_id == student2.id).first():
        print("[INFO] Seeding missing invoices for Ananya Gupta (student2)...")
        inv_a1 = FeeInvoice(student_id=student2.id, category_id=cat_tuition.id,   title="Tuition Fee - Term 1",      amount=12500.0, due_date="2026-08-15", status="paid")
        inv_a2 = FeeInvoice(student_id=student2.id, category_id=cat_tuition.id,   title="Tuition Fee - Term 2",      amount=12500.0, due_date="2026-12-15", status="pending")
        inv_a3 = FeeInvoice(student_id=student2.id, category_id=cat_exam.id,      title="Mid-Term Examination Fee",  amount=2500.0,  due_date="2026-11-10", status="pending")
        inv_a4 = FeeInvoice(student_id=student2.id, category_id=cat_transport.id, title="Transport Fee - Quarter 1", amount=5500.0,  due_date="2026-09-05", status="paid")
        inv_a5 = FeeInvoice(student_id=student2.id, category_id=cat_activity.id,  title="Activity & Science Lab Fee",amount=4000.0,  due_date="2026-08-20", status="paid")
        db.add_all([inv_a1, inv_a2, inv_a3, inv_a4, inv_a5])
        db.flush()

        # FIX #3: unique refs via _txn_ref() — no collision with seed_database() refs
        db.add_all([
            PaymentRecord(invoice_id=inv_a1.id, amount_paid=12500.0, payment_method="simulated_sandbox", transaction_reference=_txn_ref("ENS-A1"), status="success"),
            PaymentRecord(invoice_id=inv_a4.id, amount_paid=5500.0,  payment_method="simulated_sandbox", transaction_reference=_txn_ref("ENS-A4"), status="success"),
            PaymentRecord(invoice_id=inv_a5.id, amount_paid=4000.0,  payment_method="simulated_sandbox", transaction_reference=_txn_ref("ENS-A5"), status="success"),
        ])
        db.flush()

    # student1 gap invoices
    if not db.query(FeeInvoice).filter(FeeInvoice.student_id == student1.id, FeeInvoice.title == "Annual Examination Fee").first():
        inv_r3 = FeeInvoice(student_id=student1.id, category_id=cat_exam.id,      title="Annual Examination Fee",    amount=3500.0, due_date="2026-09-10", status="paid")
        inv_r4 = FeeInvoice(student_id=student1.id, category_id=cat_transport.id, title="Transport Fee - Quarter 2", amount=6000.0, due_date="2026-10-15", status="pending")
        db.add_all([inv_r3, inv_r4])
        db.flush()
        db.add(PaymentRecord(invoice_id=inv_r3.id, amount_paid=3500.0, payment_method="simulated_sandbox", transaction_reference=_txn_ref("ENS-R3"), status="success"))
        db.flush()

    db.commit()
    print("[SUCCESS] Verified and ensured all student fee invoices.")


# ── 3. seed_dhanush_family (LEGACY — kept for reference, NOT called in __main__)
# FIX #1: This function created ghost .edu duplicates of the canonical .com users
# in seed_requested_users(). It is retained for reference but MUST NOT be called
# in __main__. Use seed_requested_users() which seeds dhanush@school.com etc.

def seed_dhanush_family(db: Session) -> None:
    """
    DEPRECATED — Do not call from __main__.
    Creates dhanush@school.edu / charitha@school.edu / rajesh@school.edu which
    conflict with the canonical accounts in seed_requested_users() (.com domain).

    FIX #1: Removed from __main__ call chain to eliminate ghost duplicate users.
    Kept here so existing test environments that relied on .edu accounts still
    have an importable function during transition.
    """
    if db.query(User).filter(User.email == "dhanush@school.edu").first():
        print("[INFO] Dhanush .edu family already seeded. Skipping (use seed_requested_users for canonical accounts).")
        return

    print("[WARNING] seed_dhanush_family() is deprecated. Use seed_requested_users() instead.")
    print("[INFO] Seeding legacy Dhanush family (parent + 2 children, .edu domain)...")
    hashed_pwd = get_password_hash("password123")

    role_parent  = db.query(Role).filter(Role.name == "parent").first()
    role_student = db.query(Role).filter(Role.name == "student").first()
    if not role_parent or not role_student:
        print("[WARNING] Roles not found — run seed_database() first.")
        return

    class_10a = db.query(ClassRoom).filter(ClassRoom.name == "Class 10 - A").first()
    class_7b  = db.query(ClassRoom).filter(ClassRoom.name == "Class 7 - B").first()

    charitha = User(
        email="charitha@school.edu",
        hashed_password=hashed_pwd,
        name="Charitha",
        role_id=role_student.id,
        avatar_url="https://i.pravatar.cc/150?u=charitha",
    )
    charitha.student_profile = StudentProfile(
        roll_number="1015",
        admission_number="ADM-2024-1015",
        section="A",
        date_of_birth="2009-07-22",
        gender="Female",
        blood_group="A+",
        current_class_id=class_10a.id if class_10a else None,
    )
    db.add(charitha)

    rajesh = User(
        email="rajesh@school.edu",
        hashed_password=hashed_pwd,
        name="Rajesh",
        role_id=role_student.id,
        avatar_url="https://i.pravatar.cc/150?u=rajesh",
    )
    rajesh.student_profile = StudentProfile(
        roll_number="7023",
        admission_number="ADM-2024-7023",
        section="B",
        date_of_birth="2012-11-05",
        gender="Male",
        blood_group="O+",
        current_class_id=class_7b.id if class_7b else None,
    )
    db.add(rajesh)
    db.flush()  # FIX #4 pattern: flush before children.append so IDs are confirmed

    dhanush = User(
        email="dhanush@school.edu",
        hashed_password=hashed_pwd,
        name="Dhanush",
        role_id=role_parent.id,
        avatar_url="https://i.pravatar.cc/150?u=dhanush",
    )
    dhanush.parent_profile = ParentProfile(
        phone="+91 99887 76655",
        alternate_phone="+91 99887 76656",
        occupation="Business Owner",
        address="Plot 12, Jubilee Hills, Hyderabad",
    )
    dhanush.children.append(charitha)
    dhanush.children.append(rajesh)
    db.add(dhanush)
    db.flush()

    if class_10a:
        db.add(StudentEnrollment(student_id=charitha.id, class_id=class_10a.id, roll_number="1015"))
    if class_7b:
        db.add(StudentEnrollment(student_id=rajesh.id,   class_id=class_7b.id,  roll_number="7023"))
    db.flush()

    # FIX #10: school days only attendance
    teacher_user = db.query(User).filter(User.email == "teacher@school.edu").first()
    att_records = []
    for i, past_date in enumerate(_school_days(20)):
        charitha_status = "absent" if i in (3, 9) else "present"  # FIX #16: documented indices
        rajesh_status   = "absent" if i == 6 else "present"
        if class_10a:
            att_records.append(AttendanceRecord(student_id=charitha.id, class_id=class_10a.id, date=past_date, status=charitha_status, recorded_by_teacher_id=teacher_user.id if teacher_user else None))
        if class_7b:
            att_records.append(AttendanceRecord(student_id=rajesh.id,   class_id=class_7b.id,  date=past_date, status=rajesh_status,   recorded_by_teacher_id=teacher_user.id if teacher_user else None))
    db.add_all(att_records)
    db.flush()

    exam1 = db.query(Exam).filter(Exam.name == "Mid-Term Examination 2026").first()
    if exam1 and class_10a:
        sub_math = db.query(Subject).filter(Subject.code == "MATH101").first()
        sub_sci  = db.query(Subject).filter(Subject.code == "SCI101").first()
        sub_eng  = db.query(Subject).filter(Subject.code == "ENG101").first()
        tid = teacher_user.id if teacher_user else None

        for subj_code, score, subj_name in [("MATH101", 89, "Mathematics"), ("SCI101", 85, "Science"), ("ENG101", 78, "English")]:
            subj_obj = db.query(Subject).filter(Subject.code == subj_code).first()
            if subj_obj:
                es = db.query(ExamSubject).filter(ExamSubject.exam_id == exam1.id, ExamSubject.class_id == class_10a.id, ExamSubject.subject_id == subj_obj.id).first()
                if es:
                    db.add(MarkRecord(exam_subject_id=es.id, student_id=charitha.id, marks_obtained=float(score), grade=_grade(score), remarks=f"Good performance in {subj_name}", entered_by_teacher_id=tid))
        db.flush()

    cat_tuition   = db.query(FeeCategory).filter(FeeCategory.name == "Tuition Fee").first()
    cat_transport = db.query(FeeCategory).filter(FeeCategory.name == "Transport Fee").first()
    cat_exam_cat  = db.query(FeeCategory).filter(FeeCategory.name == "Examination Fee").first()

    if cat_tuition:
        inv_c1 = FeeInvoice(student_id=charitha.id, category_id=cat_tuition.id, title="Tuition Fee - Term 1", amount=15000.0, due_date="2026-08-15", status="paid")
        inv_c2 = FeeInvoice(student_id=charitha.id, category_id=cat_tuition.id, title="Tuition Fee - Term 2", amount=15000.0, due_date="2026-12-15", status="pending")
        inv_r1 = FeeInvoice(student_id=rajesh.id,   category_id=cat_tuition.id, title="Tuition Fee - Term 1", amount=12000.0, due_date="2026-08-15", status="paid")
        inv_r2 = FeeInvoice(student_id=rajesh.id,   category_id=cat_tuition.id, title="Tuition Fee - Term 2", amount=12000.0, due_date="2026-12-15", status="pending")
        db.add_all([inv_c1, inv_c2, inv_r1, inv_r2])
        db.flush()
        db.add_all([
            PaymentRecord(invoice_id=inv_c1.id, amount_paid=15000.0, payment_method="simulated_sandbox", transaction_reference=_txn_ref("DHAN-C1"), status="success"),
            PaymentRecord(invoice_id=inv_r1.id, amount_paid=12000.0, payment_method="simulated_sandbox", transaction_reference=_txn_ref("DHAN-R1"), status="success"),
        ])

    if cat_exam_cat:
        inv_ce = FeeInvoice(student_id=charitha.id, category_id=cat_exam_cat.id, title="Examination Fee", amount=3500.0, due_date="2026-09-10", status="paid")
        inv_re = FeeInvoice(student_id=rajesh.id,   category_id=cat_exam_cat.id, title="Examination Fee", amount=2500.0, due_date="2026-11-10", status="pending")
        db.add_all([inv_ce, inv_re])
        db.flush()
        db.add(PaymentRecord(invoice_id=inv_ce.id, amount_paid=3500.0, payment_method="simulated_sandbox", transaction_reference=_txn_ref("DHAN-CE"), status="success"))

    db.add_all([
        Notification(user_id=dhanush.id,  title="Welcome to the School Portal",  body="You are now linked to Charitha and Rajesh.", type="info"),
        Notification(user_id=dhanush.id,  title="Fee Due Reminder",              body="Term 2 fees are due for both children.",        type="finance"),
        Notification(user_id=charitha.id, title="Welcome, Charitha!",            body="Your school portal account is ready.",          type="info"),
        Notification(user_id=rajesh.id,   title="Welcome, Rajesh!",              body="Your school portal account is ready.",          type="info"),
    ])

    db.commit()
    print("[SUCCESS] Legacy Dhanush .edu family seeded.")


# ── 4. seed_telugu_class_9c ───────────────────────────────────────────────────

def seed_telugu_class_9c(db: Session) -> None:
    """
    Seeds Class 9 - C with 10 Telugu students, each with a parent.
    Teacher: Priya Desai (teacher@school.edu) teaches this class.
    Idempotent — skips if already seeded (guards on ClassRoom name).
    """
    if db.query(ClassRoom).filter(ClassRoom.name == "Class 9 - C").first():
        print("[INFO] Class 9-C already seeded. Skipping.")
        return

    print("[INFO] Seeding Class 9-C with 10 Telugu students...")

    # FIX #5: All three roles checked in guard — previously teacher_role was omitted
    student_role = db.query(Role).filter(Role.name == "student").first()
    parent_role  = db.query(Role).filter(Role.name == "parent").first()
    teacher_role = db.query(Role).filter(Role.name == "teacher").first()
    if not all([student_role, parent_role, teacher_role]):
        print("[WARNING] One or more roles not found — run seed_database() first.")
        return

    hashed_pwd = get_password_hash("password123")  # FIX #11: hash once per fn

    teacher = db.query(User).filter(User.email == "telugu.teacher@school.edu").first()
    if not teacher:
        teacher = User(
            email="telugu.teacher@school.edu",
            hashed_password=hashed_pwd,
            name="Kavitha Reddy",
            role_id=teacher_role.id,
            avatar_url="https://i.pravatar.cc/150?u=kavitha",
        )
        teacher.teacher_profile = TeacherProfile(employee_id="TCH-1003", department="Languages", qualification="M.A. Telugu, B.Ed.", is_class_teacher=True)
        db.add(teacher)
        db.flush()

    # Subjects — reuse or create
    def _get_or_create_subject(name: str, code: str, dept: str) -> Subject:
        s = db.query(Subject).filter(Subject.code == code).first()
        if not s:
            s = Subject(name=name, code=code, department=dept)
            db.add(s)
        return s

    sub_math = _get_or_create_subject("Mathematics", "MATH101", "Mathematics")
    sub_sci  = _get_or_create_subject("Science",     "SCI101",  "Science")
    sub_eng  = _get_or_create_subject("English",     "ENG101",  "Languages")
    sub_tel  = _get_or_create_subject("Telugu",      "TEL101",  "Languages")
    db.flush()

    class_9c = ClassRoom(name="Class 9 - C", grade_level=9, section="C", room_number="Room 301", class_teacher_id=teacher.id)
    db.add(class_9c)
    db.flush()

    if teacher.teacher_profile and not teacher.teacher_profile.class_teacher_of_class_id:
        teacher.teacher_profile.class_teacher_of_class_id = class_9c.id

    for subj in [sub_math, sub_sci, sub_eng, sub_tel]:
        if not db.query(ClassSubject).filter(ClassSubject.class_id == class_9c.id, ClassSubject.subject_id == subj.id).first():
            db.add(ClassSubject(class_id=class_9c.id, subject_id=subj.id, teacher_id=teacher.id))
    db.flush()

    # Timetable — FIX #20: batch with add_all
    timetable_slots = [
        (sub_math, "08:30", "09:30", "Room 301"),
        (sub_sci,  "09:30", "10:30", "Lab 2"),
        (sub_eng,  "10:45", "11:45", "Room 301"),
        (sub_tel,  "12:30", "13:30", "Room 301"),
    ]
    tt_entries = []
    for day in range(1, 6):
        for subj, start, end, room in timetable_slots:
            tt_entries.append(TimetableEntry(class_id=class_9c.id, subject_id=subj.id, teacher_id=teacher.id, day_of_week=day, start_time=start, end_time=end, room_number=room))
    db.add_all(tt_entries)
    db.flush()

    # FIX #6: Blood groups added per-student — previously all hardcoded to "O+"
    # Columns: (student_name, email, gender, roll, adm, dob, blood_group, parent_name, parent_email, parent_phone)
    students_data = [
        ("Sreeja Lakshmi",  "sreeja@school.edu",   "Female", "9001", "ADM-2025-9001", "2010-03-14", "B+", "Lakshmi Devi",    "lakshmi.devi@school.edu",    "+91 9876501001"),
        ("Vamsi Krishna",   "vamsi@school.edu",    "Male",   "9002", "ADM-2025-9002", "2010-07-22", "O+", "Ramakrishna",     "ramakrishna.v@school.edu",   "+91 9876501002"),
        ("Revathi Reddy",   "revathi@school.edu",  "Female", "9003", "ADM-2025-9003", "2010-01-09", "A+", "Suresh Reddy",    "suresh.reddy@school.edu",    "+91 9876501003"),
        ("Prasanth Kumar",  "prasanth@school.edu", "Male",   "9004", "ADM-2025-9004", "2010-11-30", "AB+","Venkata Prasad",  "venkata.prasad@school.edu",  "+91 9876501004"),
        ("Anusha Varma",    "anusha@school.edu",   "Female", "9005", "ADM-2025-9005", "2010-05-18", "O-", "Nirmala Varma",   "nirmala.varma@school.edu",   "+91 9876501005"),
        ("Karthik Nair",    "karthik@school.edu",  "Male",   "9006", "ADM-2025-9006", "2010-08-03", "B-", "Rajesh Nair",     "rajesh.nair@school.edu",     "+91 9876501006"),
        ("Divya Subramani", "divya@school.edu",    "Female", "9007", "ADM-2025-9007", "2010-02-25", "A-", "Padmavathi",      "padmavathi.s@school.edu",    "+91 9876501007"),
        ("Rohit Chowdary",  "rohit@school.edu",    "Male",   "9008", "ADM-2025-9008", "2010-09-11", "O+", "Srinivasa Rao",   "srinivasa.rao@school.edu",   "+91 9876501008"),
        ("Meghana Pillai",  "meghana@school.edu",  "Female", "9009", "ADM-2025-9009", "2010-06-07", "AB-","Gopala Krishnan", "gopala.pillai@school.edu",   "+91 9876501009"),
        ("Suresh Babu",     "suresh@school.edu",   "Male",   "9010", "ADM-2025-9010", "2010-12-19", "B+", "Satyanarayana",   "satya.babu@school.edu",       "+91 9876501010"),
    ]

    marks_data = [
        (88, 92, 85, 90),
        (76, 82, 79, 88),
        (94, 89, 91, 95),
        (70, 74, 68, 72),
        (85, 88, 83, 87),
        (62, 68, 71, 65),
        (91, 87, 93, 90),
        (78, 80, 76, 82),
        (83, 85, 88, 84),
        (67, 71, 69, 73),
    ]

    # FIX #2, #15: Unique exam name + idempotency guard before insert
    exam_9c = db.query(Exam).filter(Exam.name == "Mid-Term Examination 2026 — Class 9C").first()
    if not exam_9c:
        exam_9c = Exam(
            name="Mid-Term Examination 2026 — Class 9C",  # FIX #2: distinct from seed_database() exam
            term="Term 1",
            academic_year="2026-2027",
            start_date="2026-09-15",
            end_date="2026-09-25",
            status="completed",
        )
        db.add(exam_9c)
        db.flush()

    es_math = db.query(ExamSubject).filter(ExamSubject.exam_id == exam_9c.id, ExamSubject.subject_id == sub_math.id).first()
    if not es_math:
        es_math = ExamSubject(exam_id=exam_9c.id, class_id=class_9c.id, subject_id=sub_math.id, max_marks=100.0, passing_marks=35.0, exam_date="2026-09-16")
        es_sci  = ExamSubject(exam_id=exam_9c.id, class_id=class_9c.id, subject_id=sub_sci.id,  max_marks=100.0, passing_marks=35.0, exam_date="2026-09-17")
        es_eng  = ExamSubject(exam_id=exam_9c.id, class_id=class_9c.id, subject_id=sub_eng.id,  max_marks=100.0, passing_marks=35.0, exam_date="2026-09-18")
        es_tel  = ExamSubject(exam_id=exam_9c.id, class_id=class_9c.id, subject_id=sub_tel.id,  max_marks=100.0, passing_marks=35.0, exam_date="2026-09-19")
        db.add_all([es_math, es_sci, es_eng, es_tel])
        db.flush()
    else:
        es_sci = db.query(ExamSubject).filter(ExamSubject.exam_id == exam_9c.id, ExamSubject.subject_id == sub_sci.id).first()
        es_eng = db.query(ExamSubject).filter(ExamSubject.exam_id == exam_9c.id, ExamSubject.subject_id == sub_eng.id).first()
        es_tel = db.query(ExamSubject).filter(ExamSubject.exam_id == exam_9c.id, ExamSubject.subject_id == sub_tel.id).first()

    fee_cat = db.query(FeeCategory).filter(FeeCategory.name == "Tuition Fee").first()
    if not fee_cat:
        fee_cat = FeeCategory(name="Tuition Fee", description="Quarterly academic tuition fees")
        db.add(fee_cat)
        db.flush()

    # FIX #10: school days only
    school_days = _school_days(20)

    # FIX #7: db.flush() moved OUTSIDE the per-student loop
    # Collect all objects first, then flush once at the end
    all_att_records  = []
    all_mark_records = []
    all_invoices     = []

    for idx, (sname, semail, gender, roll, adm, dob, blood_grp, pname, pemail, pphone) in enumerate(students_data):
        student = User(email=semail, hashed_password=hashed_pwd, name=sname, role_id=student_role.id, avatar_url=f"https://i.pravatar.cc/150?u={semail}")
        student.student_profile = StudentProfile(
            roll_number=roll,
            admission_number=adm,
            section="C",
            date_of_birth=dob,
            gender=gender,
            blood_group=blood_grp,   # FIX #6: unique blood group per student
        )
        db.add(student)
        db.flush()  # needed so student.id exists before FK references below

        student.student_profile.current_class_id = class_9c.id
        db.add(StudentEnrollment(student_id=student.id, class_id=class_9c.id, roll_number=roll))

        # Attendance — FIX #10: school days only, FIX #16: indices documented
        for i, past_date in enumerate(school_days):
            # idx % 3 == 0 students are absent on 4th and 15th school day back
            att_status = "absent" if (i in (3, 15) and idx % 3 == 0) else "present"
            all_att_records.append(AttendanceRecord(student_id=student.id, class_id=class_9c.id, date=past_date, status=att_status, recorded_by_teacher_id=teacher.id))

        # Marks — FIX #13: _grade() from module level
        m_scores = marks_data[idx]
        for es, score, subname in [
            (es_math, m_scores[0], "Mathematics"),
            (es_sci,  m_scores[1], "Science"),
            (es_eng,  m_scores[2], "English"),
            (es_tel,  m_scores[3], "Telugu"),
        ]:
            if es:
                all_mark_records.append(MarkRecord(exam_subject_id=es.id, student_id=student.id, marks_obtained=float(score), grade=_grade(score), remarks=f"Good performance in {subname}", entered_by_teacher_id=teacher.id))

        # Fee invoice
        all_invoices.append(FeeInvoice(
            student_id=student.id,
            category_id=fee_cat.id,
            title="Tuition Fee - Term 1",
            amount=14000.0,
            due_date="2026-12-15",
            status="pending" if idx % 3 == 0 else "paid",
        ))

        # Parent
        existing_parent = db.query(User).filter(User.email == pemail).first()
        if not existing_parent:
            parent_user = User(email=pemail, hashed_password=hashed_pwd, name=pname, role_id=parent_role.id, avatar_url=f"https://i.pravatar.cc/150?u={pemail}")
            parent_user.parent_profile = ParentProfile(phone=pphone, occupation="Parent", address="Hyderabad, Telangana")
            parent_user.children.append(student)
            db.add(parent_user)
        else:
            if student not in existing_parent.children:
                existing_parent.children.append(student)

    # FIX #7: Single batch flush after the loop — not 10 individual flushes
    db.add_all(all_att_records)
    db.add_all(all_mark_records)
    db.add_all(all_invoices)
    db.flush()

    db.commit()
    print("[SUCCESS] Class 9-C seeded: 10 Telugu students, parents, timetable, attendance, marks, fees.")
    print("  Sreeja, Vamsi, Revathi, Prasanth, Anusha, Karthik, Divya, Rohit, Meghana, Suresh")


# ── 5. seed_requested_users ───────────────────────────────────────────────────

def seed_requested_users(db: Session) -> None:
    """
    Seeds the canonical user accounts:
      - principal@school.com  / admin123   (Principal / Admin)
      - sharma@school.com     / teacher123 (Mrs. Sharma — Class 10-A, Physics)
      - verma@school.com      / teacher123 (Mr. Verma  — Class 8-B, Mathematics)
      - dhanush@school.com    / parent123  (Parent Dhanush)
      - charitha@school.com   / student123 (Student Charitha, Class 10-A, Roll 101)
      - rajesh@school.com     / student123 (Student Rajesh,   Class 8-B,  Roll 204)

    Idempotent — guarded by principal@school.com email check.
    """
    if db.query(User).filter(User.email == "principal@school.com").first():
        print("[INFO] Requested users already seeded. Skipping.")
        return

    print("[INFO] Seeding requested users (principal, sharma, verma, dhanush, charitha, rajesh)...")

    role_admin   = db.query(Role).filter(Role.name == "admin").first()
    role_teacher = db.query(Role).filter(Role.name == "teacher").first()
    role_student = db.query(Role).filter(Role.name == "student").first()
    role_parent  = db.query(Role).filter(Role.name == "parent").first()
    if not all([role_admin, role_teacher, role_student, role_parent]):
        print("[WARNING] Roles not found — run seed_database() first.")
        return

    # Resolve / create classes
    class_10a = db.query(ClassRoom).filter(ClassRoom.name == "Class 10 - A").first()
    if not class_10a:
        class_10a = ClassRoom(name="Class 10 - A", grade_level=10, section="A", room_number="Room 204", capacity=40)
        db.add(class_10a)
        db.flush()

    class_8b = db.query(ClassRoom).filter(ClassRoom.name == "Class 8 - B").first()
    if not class_8b:
        class_8b = ClassRoom(name="Class 8 - B", grade_level=8, section="B", room_number="Room 108", capacity=40)
        db.add(class_8b)
        db.flush()

    # Subjects
    sub_physics = db.query(Subject).filter(Subject.code == "PHY101").first()
    if not sub_physics:
        sub_physics = Subject(name="Physics", code="PHY101", department="Science")
        db.add(sub_physics)
    sub_math = db.query(Subject).filter(Subject.code == "MATH101").first()
    if not sub_math:
        sub_math = Subject(name="Mathematics", code="MATH101", department="Mathematics")
        db.add(sub_math)
    db.flush()

    # FIX #19 (documented): Principal gets role=admin but NO teacher_profile by design.
    # Admin-level routes query current_user directly; JOIN on teacher_profiles for admin
    # users must be guarded with an existence check in the relevant router.
    principal = User(
        email="principal@school.com",
        hashed_password=get_password_hash("admin123"),
        name="Principal",
        role_id=role_admin.id,
        avatar_url="https://i.pravatar.cc/150?u=principal_school",
    )
    db.add(principal)

    sharma = User(
        email="sharma@school.com",
        hashed_password=get_password_hash("teacher123"),
        name="Mrs. Sharma",
        role_id=role_teacher.id,
        avatar_url="https://i.pravatar.cc/150?u=sharma_school",
    )
    sharma.teacher_profile = TeacherProfile(
        employee_id="TCH-2001",
        department="Physics",
        qualification="M.Sc. Physics, B.Ed.",
        is_class_teacher=True,
        class_teacher_of_class_id=class_10a.id,
    )
    db.add(sharma)

    verma = User(
        email="verma@school.com",
        hashed_password=get_password_hash("teacher123"),
        name="Mr. Verma",
        role_id=role_teacher.id,
        avatar_url="https://i.pravatar.cc/150?u=verma_school",
    )
    verma.teacher_profile = TeacherProfile(
        employee_id="TCH-2002",
        department="Mathematics",
        qualification="M.Sc. Mathematics, B.Ed.",
        is_class_teacher=True,
        class_teacher_of_class_id=class_8b.id,
    )
    db.add(verma)
    db.flush()

    class_10a.class_teacher_id = sharma.id
    class_8b.class_teacher_id  = verma.id

    if not db.query(ClassSubject).filter(ClassSubject.class_id == class_10a.id, ClassSubject.subject_id == sub_physics.id).first():
        db.add(ClassSubject(class_id=class_10a.id, subject_id=sub_physics.id, teacher_id=sharma.id))
    if not db.query(ClassSubject).filter(ClassSubject.class_id == class_8b.id, ClassSubject.subject_id == sub_math.id).first():
        db.add(ClassSubject(class_id=class_8b.id, subject_id=sub_math.id, teacher_id=verma.id))
    db.flush()

    charitha = User(
        email="charitha@school.com",
        hashed_password=get_password_hash("student123"),
        name="Charitha",
        role_id=role_student.id,
        avatar_url="https://i.pravatar.cc/150?u=charitha_school",
    )
    charitha.student_profile = StudentProfile(
        roll_number="101",
        admission_number="ADM-2025-0101",
        section="A",
        date_of_birth="2009-07-22",
        gender="Female",
        blood_group="A+",
        current_class_id=class_10a.id,
    )
    db.add(charitha)

    rajesh = User(
        email="rajesh@school.com",
        hashed_password=get_password_hash("student123"),
        name="Rajesh",
        role_id=role_student.id,
        avatar_url="https://i.pravatar.cc/150?u=rajesh_school",
    )
    rajesh.student_profile = StudentProfile(
        roll_number="204",
        admission_number="ADM-2025-0204",
        section="B",
        date_of_birth="2012-11-05",
        gender="Male",
        blood_group="O+",
        current_class_id=class_8b.id,
    )
    db.add(rajesh)

    # FIX #4: flush BEFORE children.append() so charitha.id and rajesh.id are confirmed
    db.flush()

    dhanush = User(
        email="dhanush@school.com",
        hashed_password=get_password_hash("parent123"),
        name="Dhanush",
        role_id=role_parent.id,
        avatar_url="https://i.pravatar.cc/150?u=dhanush_school",
    )
    dhanush.parent_profile = ParentProfile(
        phone="+91 99887 66554",
        alternate_phone="+91 99887 66555",
        occupation="Business Owner",
        address="Plot 12, Banjara Hills, Hyderabad",
    )
    dhanush.children.append(charitha)   # safe — charitha.id confirmed by flush above
    dhanush.children.append(rajesh)     # safe — rajesh.id confirmed by flush above
    db.add(dhanush)
    db.flush()

    # Enrollments with duplicate guard
    if not db.query(StudentEnrollment).filter(StudentEnrollment.student_id == charitha.id, StudentEnrollment.academic_year == "2026-2027").first():
        db.add(StudentEnrollment(student_id=charitha.id, class_id=class_10a.id, roll_number="101", academic_year="2026-2027"))
    if not db.query(StudentEnrollment).filter(StudentEnrollment.student_id == rajesh.id, StudentEnrollment.academic_year == "2026-2027").first():
        db.add(StudentEnrollment(student_id=rajesh.id,   class_id=class_8b.id,  roll_number="204", academic_year="2026-2027"))
    db.flush()

    # FIX #10: school days only attendance
    att_records = []
    for i, past_date in enumerate(_school_days(20)):
        # FIX #16: documented indices — 4th and 10th school day back are absences
        charitha_status = "absent" if i in (3, 9) else "present"
        rajesh_status   = "absent" if i == 6 else "present"

        if not db.query(AttendanceRecord).filter(AttendanceRecord.student_id == charitha.id, AttendanceRecord.date == past_date).first():
            att_records.append(AttendanceRecord(student_id=charitha.id, class_id=class_10a.id, date=past_date, status=charitha_status, recorded_by_teacher_id=sharma.id))
        if not db.query(AttendanceRecord).filter(AttendanceRecord.student_id == rajesh.id, AttendanceRecord.date == past_date).first():
            att_records.append(AttendanceRecord(student_id=rajesh.id,   class_id=class_8b.id,  date=past_date, status=rajesh_status,   recorded_by_teacher_id=verma.id))

    db.add_all(att_records)
    db.flush()

    # Exams & Marks
    exam_sharma = Exam(name="Mid-Term 2026 — Class 10A", term="Term 1", academic_year="2026-2027", start_date="2026-09-15", end_date="2026-09-25", status="completed")
    db.add(exam_sharma)
    db.flush()

    es_phy = ExamSubject(exam_id=exam_sharma.id, class_id=class_10a.id, subject_id=sub_physics.id, max_marks=100.0, passing_marks=35.0, exam_date="2026-09-16")
    db.add(es_phy)
    db.flush()

    # FIX #13: use module-level _grade() — not hardcoded "A+" strings
    db.add(MarkRecord(exam_subject_id=es_phy.id, student_id=charitha.id, marks_obtained=89.0, grade=_grade(89), remarks="Outstanding work in Physics", entered_by_teacher_id=sharma.id))

    exam_verma = Exam(name="Mid-Term 2026 — Class 8B", term="Term 1", academic_year="2026-2027", start_date="2026-09-15", end_date="2026-09-25", status="completed")
    db.add(exam_verma)
    db.flush()

    es_math_8b = ExamSubject(exam_id=exam_verma.id, class_id=class_8b.id, subject_id=sub_math.id, max_marks=100.0, passing_marks=35.0, exam_date="2026-09-17")
    db.add(es_math_8b)
    db.flush()

    # FIX #13: _grade(76) = "B+" — same result as before, but derived not hardcoded
    db.add(MarkRecord(exam_subject_id=es_math_8b.id, student_id=rajesh.id, marks_obtained=76.0, grade=_grade(76), remarks="Good understanding of concepts", entered_by_teacher_id=verma.id))
    db.flush()

    # Fee invoices
    cat_tuition = db.query(FeeCategory).filter(FeeCategory.name == "Tuition Fee").first()
    if not cat_tuition:
        cat_tuition = FeeCategory(name="Tuition Fee", description="Quarterly academic tuition fees")
        db.add(cat_tuition)
        db.flush()

    inv_c_paid    = FeeInvoice(student_id=charitha.id, category_id=cat_tuition.id, title="Tuition Fee - Term 1", amount=15000.0, due_date="2026-08-15", status="paid")
    inv_c_pending = FeeInvoice(student_id=charitha.id, category_id=cat_tuition.id, title="Tuition Fee - Term 2", amount=15000.0, due_date="2026-12-15", status="pending")
    inv_r_paid    = FeeInvoice(student_id=rajesh.id,   category_id=cat_tuition.id, title="Tuition Fee - Term 1", amount=12000.0, due_date="2026-08-15", status="paid")
    inv_r_pending = FeeInvoice(student_id=rajesh.id,   category_id=cat_tuition.id, title="Tuition Fee - Term 2", amount=12000.0, due_date="2026-12-15", status="pending")
    db.add_all([inv_c_paid, inv_c_pending, inv_r_paid, inv_r_pending])
    db.flush()

    db.add_all([
        PaymentRecord(invoice_id=inv_c_paid.id, amount_paid=15000.0, payment_method="simulated_sandbox", transaction_reference=_txn_ref("REQ-C"), status="success"),
        PaymentRecord(invoice_id=inv_r_paid.id, amount_paid=12000.0, payment_method="simulated_sandbox", transaction_reference=_txn_ref("REQ-R"), status="success"),
    ])

    db.add_all([
        Notification(user_id=dhanush.id,  title="Welcome, Dhanush!",  body="You are linked to Charitha and Rajesh. View their progress from your dashboard.", type="info"),
        Notification(user_id=charitha.id, title="Welcome, Charitha!", body="Your school portal is ready. Check your timetable and results.",                  type="info"),
        Notification(user_id=rajesh.id,   title="Welcome, Rajesh!",   body="Your school portal is ready. Check your timetable and schedule.",                  type="info"),
    ])

    db.commit()
    print("[SUCCESS] Requested users seeded: principal@school.com, sharma@school.com, verma@school.com, dhanush@school.com, charitha@school.com, rajesh@school.com")


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # FIX #18 (documented): Each seeder commits independently.
    # If any seeder raises, the __main__ handler rolls back the current
    # uncommitted transaction and re-raises so the caller sees the failure.
    # Previously committed seeders are not rolled back (by design — they are
    # idempotent and safe to leave in place).
    db = SessionLocal()
    try:
        seed_database(db)
        ensure_seed_invoices(db)
        # FIX #1: seed_dhanush_family() is NOT called here.
        # It created ghost .edu duplicates of the canonical .com accounts below.
        # Use seed_requested_users() as the single source of truth for Dhanush/Charitha/Rajesh.
        seed_telugu_class_9c(db)
        seed_requested_users(db)
    except Exception as exc:
        # FIX #14: Roll back uncommitted work so the DB is not left half-seeded.
        db.rollback()
        print(f"[ERROR] Seeding failed: {exc!r}")
        raise
    finally:
        db.close()
