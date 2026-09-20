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
    PaymentRecord,
    MarkRecord,
    Message,
    Notification,
    ParentProfile,
    Permission,
    Role,
    StudentEnrollment,
    StudentProfile,
    Subject,
    TeacherProfile,
    TimetableEntry,
    User,
)


def seed_database(db: Session) -> None:
    print("[INFO] Creating all tables if not exist...")
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    existing_admin = db.query(User).filter(User.email == "admin@school.edu").first()
    if existing_admin:
        print("[INFO] Database already seeded. Skipping.")
        return

    print("[INFO] Seeding granular permissions...")
    permissions_data = [
        # Attendance
        ("attendance:mark", "Mark Attendance", "Permission to record class attendance", "attendance"),
        ("attendance:read", "View Attendance", "Permission to view student/class attendance", "attendance"),
        ("attendance:update", "Update Attendance", "Permission to edit attendance records", "attendance"),
        # Marks & Exams
        ("marks:write", "Enter Marks", "Permission to enter and edit student marks", "marks"),
        ("marks:read", "View Marks", "Permission to view report cards and grades", "marks"),
        ("exams:manage", "Manage Exams", "Permission to schedule and edit exams", "marks"),
        # Timetable
        ("timetable:manage", "Manage Timetable", "Permission to configure timetables", "timetable"),
        ("timetable:read", "View Timetable", "Permission to view timetable schedules", "timetable"),
        # Classes & Subjects
        ("classes:manage", "Manage Classes", "Permission to create classes and assign rosters", "classes"),
        ("classes:read", "View Classes", "Permission to view class lists and student rosters", "classes"),
        # Finance
        ("finance:read", "View Finance", "Permission to view fee invoices and statements", "finance"),
        ("finance:pay_mock", "Pay Fees (Simulated)", "Permission to execute simulated fee payments", "finance"),
        ("finance:manage", "Manage Finance", "Permission to create fee categories and invoices", "finance"),
        # Communication & Chat
        ("chat:read", "Read Chat", "Permission to view conversation threads", "chat"),
        ("chat:send", "Send Chat", "Permission to send chat messages", "chat"),
        ("events:create", "Create Events", "Permission to publish school events and announcements", "events"),
        ("events:read", "View Events", "Permission to view events calendar", "events"),
        # User Management
        ("users:manage", "Manage Users", "Permission to create and manage user accounts", "users"),
        ("users:read", "View Users", "Permission to view user directory", "users"),
    ]

    permission_map = {}
    for code, name, desc, mod in permissions_data:
        perm = Permission(code=code, name=name, description=desc, module=mod)
        db.add(perm)
        permission_map[code] = perm

    db.flush()

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

    for role_obj in roles.values():
        db.add(role_obj)
    db.flush()

    print("[INFO] Seeding baseline users...")
    hashed_pwd = get_password_hash("password123")

    # Admin User
    admin_user = User(
        email="admin@school.edu",
        hashed_password=hashed_pwd,
        name="Dr. Alok Verma",
        role_id=roles["admin"].id,
        avatar_url="https://i.pravatar.cc/150?u=admin",
    )
    db.add(admin_user)

    # Teacher User (Priya Desai)
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

    # Additional Teacher (Vikram Singh - Science)
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

    # Student 1: Rahul Sharma (Class 10 - A)
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

    # Student 2: Ananya Gupta (Class 7 - B)
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

    # Parent User (Vikram Sharma - parent of Rahul and Ananya)
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
    parent_user.children.append(student1)
    parent_user.children.append(student2)
    db.add(parent_user)

    db.flush()

    print("[INFO] Seeding classes and subjects...")
    # Classes
    class_10a = ClassRoom(
        name="Class 10 - A",
        grade_level=10,
        section="A",
        room_number="Room 204",
        class_teacher_id=teacher_user.id,
    )
    class_10b = ClassRoom(
        name="Class 10 - B",
        grade_level=10,
        section="B",
        room_number="Room 205",
    )
    class_7b = ClassRoom(
        name="Class 7 - B",
        grade_level=7,
        section="B",
        room_number="Room 102",
    )
    db.add_all([class_10a, class_10b, class_7b])
    db.flush()

    # Update profiles with class ID
    student1.student_profile.current_class_id = class_10a.id
    student2.student_profile.current_class_id = class_7b.id
    teacher_user.teacher_profile.class_teacher_of_class_id = class_10a.id

    # Subjects
    sub_math = Subject(name="Mathematics", code="MATH101", department="Mathematics")
    sub_sci = Subject(name="Science", code="SCI101", department="Science")
    sub_eng = Subject(name="English", code="ENG101", department="Languages")
    sub_soc = Subject(name="Social Studies", code="SOC101", department="Social Science")
    db.add_all([sub_math, sub_sci, sub_eng, sub_soc])
    db.flush()

    # Assign subjects to Class 10 - A
    cs1 = ClassSubject(class_id=class_10a.id, subject_id=sub_math.id, teacher_id=teacher_user.id)
    cs2 = ClassSubject(class_id=class_10a.id, subject_id=sub_sci.id, teacher_id=teacher2.id)
    cs3 = ClassSubject(class_id=class_10a.id, subject_id=sub_eng.id, teacher_id=teacher_user.id)
    db.add_all([cs1, cs2, cs3])

    # Enrollments
    enr1 = StudentEnrollment(student_id=student1.id, class_id=class_10a.id, roll_number="1014")
    enr2 = StudentEnrollment(student_id=student2.id, class_id=class_7b.id, roll_number="7022")
    db.add_all([enr1, enr2])
    db.flush()

    print("[INFO] Seeding timetable...")
    # Timetable for Class 10-A (Monday=1 through Friday=5)
    for day in range(1, 6):
        db.add(
            TimetableEntry(
                class_id=class_10a.id,
                subject_id=sub_math.id,
                teacher_id=teacher_user.id,
                day_of_week=day,
                start_time="08:30",
                end_time="09:30",
                room_number="Room 204",
            )
        )
        db.add(
            TimetableEntry(
                class_id=class_10a.id,
                subject_id=sub_sci.id,
                teacher_id=teacher2.id,
                day_of_week=day,
                start_time="09:30",
                end_time="10:30",
                room_number="Lab 1",
            )
        )
        db.add(
            TimetableEntry(
                class_id=class_10a.id,
                subject_id=sub_eng.id,
                teacher_id=teacher_user.id,
                day_of_week=day,
                start_time="10:45",
                end_time="11:45",
                room_number="Room 204",
            )
        )
    db.flush()

    print("[INFO] Seeding attendance history...")
    today = datetime.now(timezone.utc).date()
    # 20 days of historical records
    for i in range(20):
        past_date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        # Rahul absent on 2 days
        status1 = "absent" if i in (4, 12) else "present"
        db.add(
            AttendanceRecord(
                student_id=student1.id,
                class_id=class_10a.id,
                date=past_date,
                status=status1,
                recorded_by_teacher_id=teacher_user.id,
            )
        )
        # Ananya present on all
        db.add(
            AttendanceRecord(
                student_id=student2.id,
                class_id=class_7b.id,
                date=past_date,
                status="present",
                recorded_by_teacher_id=teacher_user.id,
            )
        )
    db.flush()

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
    es_sci = ExamSubject(exam_id=exam1.id, class_id=class_10a.id, subject_id=sub_sci.id, max_marks=100.0, passing_marks=35.0, exam_date="2026-09-18")
    es_eng = ExamSubject(exam_id=exam1.id, class_id=class_10a.id, subject_id=sub_eng.id, max_marks=100.0, passing_marks=35.0, exam_date="2026-09-20")
    db.add_all([es_math, es_sci, es_eng])
    db.flush()

    m1 = MarkRecord(exam_subject_id=es_math.id, student_id=student1.id, marks_obtained=87.0, grade="A", remarks="Excellent analytical ability", entered_by_teacher_id=teacher_user.id)
    m2 = MarkRecord(exam_subject_id=es_sci.id, student_id=student1.id, marks_obtained=91.0, grade="A+", remarks="Outstanding practical work", entered_by_teacher_id=teacher2.id)
    m3 = MarkRecord(exam_subject_id=es_eng.id, student_id=student1.id, marks_obtained=84.0, grade="B+", remarks="Good essay writing", entered_by_teacher_id=teacher_user.id)
    db.add_all([m1, m2, m3])
    db.flush()

    print("[INFO] Seeding events and notifications...")
    e1 = Event(title="Annual Sports Meet 2026", description="Inter-school athletic competitions and relay races.", date="2026-10-15", time="09:00 AM", location="Main School Ground", type="sports", target_audience="all")
    e2 = Event(title="Parent-Teacher Meeting", description="Quarterly academic review and performance discussion.", date="2026-10-22", time="10:00 AM", location="Classrooms", type="academic", target_audience="parent")
    e3 = Event(title="Science Exhibition", description="Project demonstration by senior secondary students.", date="2026-11-05", time="11:30 AM", location="Auditorium", type="cultural", target_audience="all")
    db.add_all([e1, e2, e3])

    n1 = Notification(user_id=student1.id, title="Exam Schedule Released", body="Mid-term exam dates are published. Check academics tab.", type="exam")
    n2 = Notification(user_id=parent_user.id, title="Fee Due Reminder", body="Term 2 tuition fee invoice is available for payment.", type="finance")
    db.add_all([n1, n2])
    db.flush()

    print("[INFO] Seeding finance invoices...")
    cat_tuition = FeeCategory(name="Tuition Fee", description="Quarterly academic tuition fees")
    cat_transport = FeeCategory(name="Transport Fee", description="School bus transportation charges")
    cat_exam = FeeCategory(name="Examination Fee", description="Term and annual exam registration fees")
    cat_activity = FeeCategory(name="Activity & Lab Fee", description="Laboratory, sports, and co-curricular charges")
    db.add_all([cat_tuition, cat_transport, cat_exam, cat_activity])
    db.flush()

    # Rahul Sharma Invoices (student1)
    inv_r1 = FeeInvoice(student_id=student1.id, category_id=cat_tuition.id, title="Tuition Fee - Term 1", amount=15000.0, due_date="2026-08-15", status="paid")
    inv_r2 = FeeInvoice(student_id=student1.id, category_id=cat_tuition.id, title="Tuition Fee - Term 2", amount=15000.0, due_date="2026-12-15", status="pending")
    inv_r3 = FeeInvoice(student_id=student1.id, category_id=cat_exam.id, title="Annual Examination Fee", amount=3500.0, due_date="2026-09-10", status="paid")
    inv_r4 = FeeInvoice(student_id=student1.id, category_id=cat_transport.id, title="Transport Fee - Quarter 2", amount=6000.0, due_date="2026-10-15", status="pending")

    # Ananya Gupta Invoices (student2)
    inv_a1 = FeeInvoice(student_id=student2.id, category_id=cat_tuition.id, title="Tuition Fee - Term 1", amount=12500.0, due_date="2026-08-15", status="paid")
    inv_a2 = FeeInvoice(student_id=student2.id, category_id=cat_tuition.id, title="Tuition Fee - Term 2", amount=12500.0, due_date="2026-12-15", status="pending")
    inv_a3 = FeeInvoice(student_id=student2.id, category_id=cat_exam.id, title="Mid-Term Examination Fee", amount=2500.0, due_date="2026-11-10", status="pending")
    inv_a4 = FeeInvoice(student_id=student2.id, category_id=cat_transport.id, title="Transport Fee - Quarter 1", amount=5500.0, due_date="2026-09-05", status="paid")
    inv_a5 = FeeInvoice(student_id=student2.id, category_id=cat_activity.id, title="Activity & Science Lab Fee", amount=4000.0, due_date="2026-08-20", status="paid")

    db.add_all([inv_r1, inv_r2, inv_r3, inv_r4, inv_a1, inv_a2, inv_a3, inv_a4, inv_a5])
    db.flush()

    # Payments records for paid invoices
    pay_r1 = PaymentRecord(invoice_id=inv_r1.id, amount_paid=15000.0, payment_method="simulated_sandbox", transaction_reference="TXN-2026-88910", status="success")
    pay_r3 = PaymentRecord(invoice_id=inv_r3.id, amount_paid=3500.0, payment_method="simulated_sandbox", transaction_reference="TXN-2026-88911", status="success")
    pay_a1 = PaymentRecord(invoice_id=inv_a1.id, amount_paid=12500.0, payment_method="simulated_sandbox", transaction_reference="TXN-2026-88912", status="success")
    pay_a4 = PaymentRecord(invoice_id=inv_a4.id, amount_paid=5500.0, payment_method="simulated_sandbox", transaction_reference="TXN-2026-88913", status="success")
    pay_a5 = PaymentRecord(invoice_id=inv_a5.id, amount_paid=4000.0, payment_method="simulated_sandbox", transaction_reference="TXN-2026-88914", status="success")
    db.add_all([pay_r1, pay_r3, pay_a1, pay_a4, pay_a5])
    db.flush()

    print("[INFO] Seeding chat conversation...")
    conv = Conversation(title="Priya Desai & Vikram Sharma", type="direct")
    conv.participants.append(teacher_user)
    conv.participants.append(parent_user)
    db.add(conv)
    db.flush()

    msg1 = Message(conversation_id=conv.id, sender_id=parent_user.id, content="Hello Ma'am, how has Rahul been performing in Math this term?", is_read=True)
    msg2 = Message(conversation_id=conv.id, sender_id=teacher_user.id, content="Good afternoon Mr. Sharma. Rahul is doing exceptionally well! He scored 87% in the mid-terms.", is_read=True)
    db.add_all([msg1, msg2])

    db.commit()
    print("[SUCCESS] Database seeded successfully!")


def ensure_seed_invoices(db: Session) -> None:
    student2 = db.query(User).filter((User.email == "ananya.g@school.edu") | (User.email == "student2@school.edu") | (User.name == "Ananya Gupta")).first()
    student1 = db.query(User).filter((User.email == "student@school.edu") | (User.name == "Rahul Sharma")).first()
    if not student2 or not student1:
        print("[WARNING] student1 or student2 not found for invoice seeding.")
        return

    # Check categories
    cat_tuition = db.query(FeeCategory).filter(FeeCategory.name == "Tuition Fee").first()
    if not cat_tuition:
        cat_tuition = FeeCategory(name="Tuition Fee", description="Quarterly academic tuition fees")
        db.add(cat_tuition)

    cat_transport = db.query(FeeCategory).filter(FeeCategory.name == "Transport Fee").first()
    if not cat_transport:
        cat_transport = FeeCategory(name="Transport Fee", description="School bus transportation charges")
        db.add(cat_transport)

    cat_exam = db.query(FeeCategory).filter(FeeCategory.name == "Examination Fee").first()
    if not cat_exam:
        cat_exam = FeeCategory(name="Examination Fee", description="Term and annual exam registration fees")
        db.add(cat_exam)

    cat_activity = db.query(FeeCategory).filter(FeeCategory.name == "Activity & Lab Fee").first()
    if not cat_activity:
        cat_activity = FeeCategory(name="Activity & Lab Fee", description="Laboratory, sports, and co-curricular charges")
        db.add(cat_activity)

    db.flush()

    # Check if student2 has invoices
    existing_a = db.query(FeeInvoice).filter(FeeInvoice.student_id == student2.id).all()
    if not existing_a:
        print("[INFO] Seeding missing invoices for Ananya Gupta (student2)...")
        inv_a1 = FeeInvoice(student_id=student2.id, category_id=cat_tuition.id, title="Tuition Fee - Term 1", amount=12500.0, due_date="2026-08-15", status="paid")
        inv_a2 = FeeInvoice(student_id=student2.id, category_id=cat_tuition.id, title="Tuition Fee - Term 2", amount=12500.0, due_date="2026-12-15", status="pending")
        inv_a3 = FeeInvoice(student_id=student2.id, category_id=cat_exam.id, title="Mid-Term Examination Fee", amount=2500.0, due_date="2026-11-10", status="pending")
        inv_a4 = FeeInvoice(student_id=student2.id, category_id=cat_transport.id, title="Transport Fee - Quarter 1", amount=5500.0, due_date="2026-09-05", status="paid")
        inv_a5 = FeeInvoice(student_id=student2.id, category_id=cat_activity.id, title="Activity & Science Lab Fee", amount=4000.0, due_date="2026-08-20", status="paid")
        db.add_all([inv_a1, inv_a2, inv_a3, inv_a4, inv_a5])
        db.flush()

        pay_a1 = PaymentRecord(invoice_id=inv_a1.id, amount_paid=12500.0, payment_method="simulated_sandbox", transaction_reference="TXN-2026-88912", status="success")
        pay_a4 = PaymentRecord(invoice_id=inv_a4.id, amount_paid=5500.0, payment_method="simulated_sandbox", transaction_reference="TXN-2026-88913", status="success")
        pay_a5 = PaymentRecord(invoice_id=inv_a5.id, amount_paid=4000.0, payment_method="simulated_sandbox", transaction_reference="TXN-2026-88914", status="success")
        db.add_all([pay_a1, pay_a4, pay_a5])
        db.flush()

    # Check if student1 has extra categories
    existing_r_exam = db.query(FeeInvoice).filter(FeeInvoice.student_id == student1.id, FeeInvoice.title == "Annual Examination Fee").first()
    if not existing_r_exam:
        inv_r3 = FeeInvoice(student_id=student1.id, category_id=cat_exam.id, title="Annual Examination Fee", amount=3500.0, due_date="2026-09-10", status="paid")
        inv_r4 = FeeInvoice(student_id=student1.id, category_id=cat_transport.id, title="Transport Fee - Quarter 2", amount=6000.0, due_date="2026-10-15", status="pending")
        db.add_all([inv_r3, inv_r4])
        db.flush()
        pay_r3 = PaymentRecord(invoice_id=inv_r3.id, amount_paid=3500.0, payment_method="simulated_sandbox", transaction_reference="TXN-2026-88911", status="success")
        db.add(pay_r3)
        db.flush()

    db.commit()
    print("[SUCCESS] Verified and ensured all student fee invoices.")


def seed_dhanush_family(db: Session) -> None:
    """
    Seeds parent Dhanush linked to children Charitha and Rajesh.
    Safe to call multiple times — guarded by email check.
    """
    # Guard: skip if already seeded
    if db.query(User).filter(User.email == "dhanush@school.edu").first():
        print("[INFO] Dhanush family already seeded. Skipping.")
        return

    print("[INFO] Seeding Dhanush family (parent + 2 children)...")
    hashed_pwd = get_password_hash("password123")

    # Fetch roles (already exist from seed_database)
    role_parent  = db.query(Role).filter(Role.name == "parent").first()
    role_student = db.query(Role).filter(Role.name == "student").first()
    if not role_parent or not role_student:
        print("[WARNING] Roles not found — run seed_database() first.")
        return

    # ── Resolve Class 10-A and Class 7-B (already seeded) ──────────────────
    class_10a = db.query(ClassRoom).filter(ClassRoom.name == "Class 10 - A").first()
    class_7b  = db.query(ClassRoom).filter(ClassRoom.name == "Class 7 - B").first()

    # ── Child 1: Charitha (Class 10 - A) ───────────────────────────────────
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

    # ── Child 2: Rajesh (Class 7 - B) ──────────────────────────────────────
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

    # ── Parent: Dhanush ─────────────────────────────────────────────────────
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
    # Link children via parent_students junction table
    dhanush.children.append(charitha)
    dhanush.children.append(rajesh)
    db.add(dhanush)
    db.flush()

    # ── Enrollments ─────────────────────────────────────────────────────────
    if class_10a:
        db.add(StudentEnrollment(student_id=charitha.id, class_id=class_10a.id, roll_number="1015"))
    if class_7b:
        db.add(StudentEnrollment(student_id=rajesh.id, class_id=class_7b.id, roll_number="7023"))
    db.flush()

    # ── 20-day attendance history ───────────────────────────────────────────
    teacher_user = db.query(User).filter(User.email == "teacher@school.edu").first()
    today = datetime.now(timezone.utc).date()
    for i in range(20):
        past_date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        # Charitha absent on days 3 and 9
        charitha_status = "absent" if i in (3, 9) else "present"
        if class_10a:
            db.add(AttendanceRecord(
                student_id=charitha.id,
                class_id=class_10a.id,
                date=past_date,
                status=charitha_status,
                recorded_by_teacher_id=teacher_user.id if teacher_user else None,
            ))
        # Rajesh absent on day 6
        rajesh_status = "absent" if i == 6 else "present"
        if class_7b:
            db.add(AttendanceRecord(
                student_id=rajesh.id,
                class_id=class_7b.id,
                date=past_date,
                status=rajesh_status,
                recorded_by_teacher_id=teacher_user.id if teacher_user else None,
            ))
    db.flush()

    # ── Marks (reuse existing Mid-Term exam if present) ─────────────────────
    exam1 = db.query(Exam).filter(Exam.name == "Mid-Term Examination 2026").first()
    if exam1 and class_10a:
        sub_math = db.query(Subject).filter(Subject.code == "MATH101").first()
        sub_sci  = db.query(Subject).filter(Subject.code == "SCI101").first()
        sub_eng  = db.query(Subject).filter(Subject.code == "ENG101").first()

        es_math = db.query(ExamSubject).filter(
            ExamSubject.exam_id == exam1.id,
            ExamSubject.class_id == class_10a.id,
            ExamSubject.subject_id == (sub_math.id if sub_math else ""),
        ).first()
        es_sci = db.query(ExamSubject).filter(
            ExamSubject.exam_id == exam1.id,
            ExamSubject.class_id == class_10a.id,
            ExamSubject.subject_id == (sub_sci.id if sub_sci else ""),
        ).first()
        es_eng = db.query(ExamSubject).filter(
            ExamSubject.exam_id == exam1.id,
            ExamSubject.class_id == class_10a.id,
            ExamSubject.subject_id == (sub_eng.id if sub_eng else ""),
        ).first()

        tid = teacher_user.id if teacher_user else None
        if es_math:
            db.add(MarkRecord(exam_subject_id=es_math.id, student_id=charitha.id, marks_obtained=89.0, grade="A+", remarks="Excellent performance", entered_by_teacher_id=tid))
        if es_sci:
            db.add(MarkRecord(exam_subject_id=es_sci.id,  student_id=charitha.id, marks_obtained=85.0, grade="A",  remarks="Good practical work",  entered_by_teacher_id=tid))
        if es_eng:
            db.add(MarkRecord(exam_subject_id=es_eng.id,  student_id=charitha.id, marks_obtained=78.0, grade="B+", remarks="Solid essay writing",   entered_by_teacher_id=tid))
        db.flush()

    # ── Fee invoices ─────────────────────────────────────────────────────────
    cat_tuition   = db.query(FeeCategory).filter(FeeCategory.name == "Tuition Fee").first()
    cat_transport = db.query(FeeCategory).filter(FeeCategory.name == "Transport Fee").first()
    cat_exam      = db.query(FeeCategory).filter(FeeCategory.name == "Examination Fee").first()

    if cat_tuition:
        inv_c1 = FeeInvoice(student_id=charitha.id, category_id=cat_tuition.id,   title="Tuition Fee - Term 1",     amount=15000.0, due_date="2026-08-15", status="paid")
        inv_c2 = FeeInvoice(student_id=charitha.id, category_id=cat_tuition.id,   title="Tuition Fee - Term 2",     amount=15000.0, due_date="2026-12-15", status="pending")
        inv_r1 = FeeInvoice(student_id=rajesh.id,   category_id=cat_tuition.id,   title="Tuition Fee - Term 1",     amount=12000.0, due_date="2026-08-15", status="paid")
        inv_r2 = FeeInvoice(student_id=rajesh.id,   category_id=cat_tuition.id,   title="Tuition Fee - Term 2",     amount=12000.0, due_date="2026-12-15", status="pending")
        db.add_all([inv_c1, inv_c2, inv_r1, inv_r2])
        db.flush()
        db.add(PaymentRecord(invoice_id=inv_c1.id, amount_paid=15000.0, payment_method="simulated_sandbox", transaction_reference="TXN-DHAN-0001", status="success"))
        db.add(PaymentRecord(invoice_id=inv_r1.id, amount_paid=12000.0, payment_method="simulated_sandbox", transaction_reference="TXN-DHAN-0002", status="success"))

    if cat_exam:
        inv_ce = FeeInvoice(student_id=charitha.id, category_id=cat_exam.id, title="Examination Fee", amount=3500.0, due_date="2026-09-10", status="paid")
        inv_re = FeeInvoice(student_id=rajesh.id,   category_id=cat_exam.id, title="Examination Fee", amount=2500.0, due_date="2026-11-10", status="pending")
        db.add_all([inv_ce, inv_re])
        db.flush()
        db.add(PaymentRecord(invoice_id=inv_ce.id, amount_paid=3500.0, payment_method="simulated_sandbox", transaction_reference="TXN-DHAN-0003", status="success"))

    # ── Welcome notifications for Dhanush ────────────────────────────────────
    db.add(Notification(
        user_id=dhanush.id,
        title="Welcome to the School Portal",
        body="You are now linked to Charitha and Rajesh. View their progress from your dashboard.",
        type="info",
    ))
    db.add(Notification(
        user_id=dhanush.id,
        title="Fee Due Reminder",
        body="Term 2 tuition fees are due for both Charitha and Rajesh. Please pay before the due date.",
        type="finance",
    ))
    db.add(Notification(
        user_id=charitha.id,
        title="Welcome, Charitha!",
        body="Your school portal account is ready. Check your timetable and results.",
        type="info",
    ))
    db.add(Notification(
        user_id=rajesh.id,
        title="Welcome, Rajesh!",
        body="Your school portal account is ready. Check your timetable and schedule.",
        type="info",
    ))

    db.commit()
    print("[SUCCESS] Dhanush family seeded: dhanush@school.edu, charitha@school.edu, rajesh@school.edu")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
        ensure_seed_invoices(db)
        seed_dhanush_family(db)
    finally:
        db.close()
