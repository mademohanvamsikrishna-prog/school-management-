# School Management System — Production Gap Analysis (20 Phases)

**Baseline Assessment:** ~26%  
**Target Milestone:** ~75% Production-Level Maturity  
**Target Architecture:**
- **Mobile/Web Frontend:** React Native / Expo (Tabs + Stack Navigation, TypeScript, Shared Design System)
- **Backend API:** FastAPI (Python 3.11+, Router → Service → Repository pattern, Pydantic v2 schemas)
- **Database:** PostgreSQL (SQLAlchemy 2.0 ORM, Alembic migrations, with SQLite fallback for seamless local test environments)
- **Security & Infrastructure:** JWT (Access + Refresh tokens), bcrypt password hashing, RBAC dependencies, comprehensive unit & integration test suites.

---

## Phase-by-Phase Gap Analysis

### PHASE 01 — Project Setup & Core Architecture
- **Current Status:** Partially Complete (Frontend starter present; Backend, Database, CI/CD missing).
- **Existing Files:** `package.json`, `app.json`, `tsconfig.json`, `src/constants/theme.ts`, `src/global.css`.
- **Existing Functionality:** Expo 54 with Expo Router, typed theme constants (`COLORS`, `SIZES`, `FONTS`), basic directory layout.
- **Missing Functionality:** 
  - FastAPI backend project structure (`backend/app/...`).
  - Database connection pool & Alembic migration pipeline.
  - API client layer in React Native (`src/services/api.ts`).
  - TypeScript cleanup for template symbol errors (`npx tsc --noEmit`).
  - Environment variables management (`.env.example`, `expo-constants`).
- **Backend Requirement:** FastAPI application factory with CORS middleware, centralized configuration via `pydantic-settings`, structured logging, and unified error handler.
- **Database Requirement:** PostgreSQL connection manager with async/sync SQLAlchemy engine, session maker, base declarative model with timestamps (`created_at`, `updated_at`, `uuid`).
- **Frontend Requirement:** Modular structure (`src/services/`, `src/store/`, `src/features/`, `src/config/`), unified API HTTP client with interceptors for token attachment and network error handling.
- **Security Requirement:** No hardcoded secrets, `.env` git-ignored, CORS limited to client origins.
- **Testing Requirement:** Pytest setup with `test_health.py`; Jest setup for frontend unit tests.
- **Estimated Completion %:** **40%** (Target: **90–100%**)

---

### PHASE 02 — Authentication + RBAC
- **Current Status:** UI Only / Mock.
- **Existing Files:** `src/app/index.tsx` (animated login form), `src/types/models.ts` (`UserRole`).
- **Existing Functionality:** Form inputs with regex email check, password length check, animated role picker, simulated timeout navigation.
- **Missing Functionality:**
  - Real password verification and token generation (JWT).
  - Refresh token mechanism and token rotation.
  - Secure storage on mobile (`expo-secure-store`) and session persistence.
  - `AuthProvider` context protecting private routes (`/students/*`, `/teacher/*`, `/parents/*`).
  - Unauthorized redirect to login screen upon 401.
  - Backend RBAC dependencies (`require_role(["admin", "teacher"])`).
- **Backend Requirement:** `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/me`, `/api/v1/auth/logout`.
- **Database Requirement:** `users` table (`id`, `email`, `hashed_password`, `role`, `is_active`, `created_at`), `roles`, `permissions` mapping table.
- **Frontend Requirement:** `AuthContext` + `useAuth()` hook, secure token storage, automatic logout on expiry, role-guarded tab rendering.
- **Security Requirement:** `bcrypt` or `argon2` password hashing, short-lived access tokens (15–60 mins), secure HTTP headers, rate limiting on `/login`.
- **Testing Requirement:** Tests for successful login, wrong password, expired token, role permission enforcement.
- **Estimated Completion %:** **20%** (Target: **80–90%**)

---

### PHASE 03 — Users + Profiles
- **Current Status:** Mock Data / Conceptual.
- **Existing Files:** `src/types/models.ts` (`User`, `Student`, `Teacher`, `Parent`), `src/mock/students.ts`, `src/mock/teachers.ts`, `src/mock/parents.ts`, `src/app/parents/profile.tsx` (placeholder), `src/app/teacher/profile.tsx` (placeholder), `src/app/students/profile.tsx` (placeholder).
- **Existing Functionality:** TypeScript interfaces and sample mock profiles.
- **Missing Functionality:**
  - Real profile screens for Student, Teacher, Parent, Admin.
  - Profile detail viewing and editing (contact info, emergency contact, bio, avatar upload).
  - Admin management of user accounts.
  - Linking Parents to their designated Children.
- **Backend Requirement:** `/api/v1/users/me`, `/api/v1/users/{id}`, `/api/v1/students`, `/api/v1/teachers`, `/api/v1/parents`.
- **Database Requirement:** Relational tables: `students` (roll_number, class_id), `teachers` (department, employee_code), `parents` (phone, occupation), `parent_student_association` junction table.
- **Frontend Requirement:** Functional profile screen with user details, edit modal/form, role badges, logout button.
- **Security Requirement:** Users may only edit their own profile fields; sensitive fields (role, class assignment, ID) are admin-only.
- **Testing Requirement:** Profile update test, parent-child association query test.
- **Estimated Completion %:** **20%** (Target: **75–85%**)

---

### PHASE 04 — Dashboard
- **Current Status:** Partially Complete (UI with Mock Data).
- **Existing Files:** `src/app/dashboard.tsx`, `src/app/students/dashboard.tsx`, `src/app/teacher/dashboard.tsx`, `src/app/parents/dashboard.tsx`, `src/components/StatCard.tsx`, `src/components/DashboardSection.tsx`, `src/components/QuickActionButton.tsx`, `src/components/ChildSelector.tsx`.
- **Existing Functionality:** Well-structured visual dashboards for Student, Teacher, and Parent with greeting header, stat cards, quick action buttons, and event previews.
- **Missing Functionality:**
  - Admin dashboard view (school-wide metrics: total students, teachers, fee collected, attendance %).
  - Real API data hydration (replacing static mock imports).
  - Pull-to-refresh state (`RefreshControl`).
  - Loading skeleton states and network error banners with retry action.
- **Backend Requirement:** `/api/v1/dashboard/summary` endpoint returning role-tailored aggregated statistics.
- **Database Requirement:** Optimized aggregation queries (COUNT of active students, attendance percentage today, upcoming events count).
- **Frontend Requirement:** Wire each dashboard to query backend API with fallback to offline/cached state; add pull-to-refresh.
- **Security Requirement:** Role-checked dashboard metrics; students cannot see school finance stats; teachers see only their class stats.
- **Testing Requirement:** Dashboard data loading test, role-filtering tests, empty-state tests.
- **Estimated Completion %:** **45%** (Target: **80–90%**)

---

### PHASE 05 — Classes + Subjects
- **Current Status:** Mock Data / Placeholder.
- **Existing Files:** `src/types/models.ts` (`Subject`), `src/app/teacher/classes.tsx` (placeholder), `src/app/students/add.tsx` (basic form).
- **Existing Functionality:** Mock classes ("Class 10 - A", "Class 7 - B") and subjects.
- **Missing Functionality:**
  - Class list and detail screen for Teachers and Admins.
  - Class student roster view.
  - Subject assignment to classes and teachers.
  - Add / edit class and subject management.
- **Backend Requirement:** CRUD endpoints for `/api/v1/classes`, `/api/v1/subjects`, `/api/v1/classes/{id}/students`.
- **Database Requirement:** `classes` (`id`, `name`, `grade_level`, `section`, `class_teacher_id`), `subjects` (`id`, `name`, `code`), `class_subjects` (`class_id`, `subject_id`, `teacher_id`).
- **Frontend Requirement:** Functional Classes screen in `/teacher/classes` displaying assigned classes, student roster, and subject list.
- **Security Requirement:** Only teachers assigned to the class or Admins can view full student contact details.
- **Testing Requirement:** CRUD class tests, class roster enrollment integrity tests.
- **Estimated Completion %:** **20%** (Target: **75–85%**)

---

### PHASE 06 — Timetable
- **Current Status:** Mock Data / Partial UI.
- **Existing Files:** `src/types/models.ts` (`TimetableEntry`), `src/mock/timetable.ts`, preview cards in student and teacher dashboards.
- **Existing Functionality:** Preview of today's timetable entries on dashboards.
- **Missing Functionality:**
  - Full weekly timetable schedule screen (Monday through Saturday).
  - Day selector tabs (Mon, Tue, Wed, Thu, Fri, Sat).
  - Conflict detection engine (prevent double-booking teacher or classroom at identical time slots).
  - Timetable viewing for Students, Teachers, and Parents.
- **Backend Requirement:** `/api/v1/timetable/class/{class_id}`, `/api/v1/timetable/teacher/{teacher_id}`, conflict validation service.
- **Database Requirement:** `timetable_entries` table (`id`, `class_id`, `subject_id`, `teacher_id`, `day_of_week`, `start_time`, `end_time`, `room_number`) with UNIQUE index constraint on `(teacher_id, day_of_week, start_time)`.
- **Frontend Requirement:** Comprehensive weekly timetable view with period cards, active period highlighting, and room numbers.
- **Security Requirement:** Timetable modification restricted to Admin and designated HODs.
- **Testing Requirement:** Double-booking prevention unit test, timetable retrieval by class & teacher tests.
- **Estimated Completion %:** **30%** (Target: **70–80%**)

---

### PHASE 07 — Attendance
- **Current Status:** Partial UI / Mock Data.
- **Existing Files:** `src/app/attendance.tsx`, `src/mock/attendance.ts`, `src/types/models.ts` (`Attendance`, `AttendanceSummary`).
- **Existing Functionality:** Standalone attendance screen with 4 students and toggle buttons; dashboard stat cards showing attendance percentage.
- **Missing Functionality:**
  - Daily class attendance register for Teachers (Select Class → Date → Mark Present/Absent/Late/Half-day).
  - Batch submission endpoint for an entire class.
  - Student & Parent historical attendance calendar and statistics.
  - Real percentage calculation based on actual records.
- **Backend Requirement:** `/api/v1/attendance/record-batch`, `/api/v1/attendance/class/{class_id}?date={date}`, `/api/v1/attendance/student/{student_id}/summary`.
- **Database Requirement:** `attendance` table (`id`, `student_id`, `class_id`, `date`, `status`, `remarks`, `recorded_by_teacher_id`, `updated_at`). Unique constraint on `(student_id, date)`.
- **Frontend Requirement:** Attendance marking view for Teachers with bulk "Mark All Present" shortcut and individual toggles; Attendance history view for Students/Parents.
- **Security Requirement:** Teachers can only submit attendance for their assigned classes; records cannot be modified after lock period without admin override.
- **Testing Requirement:** Batch record attendance test, duplicate prevention test, summary percentage formula test.
- **Estimated Completion %:** **30%** (Target: **75–85%**)

---

### PHASE 08 — Marks + Exams
- **Current Status:** Partial UI / Mock Data.
- **Existing Files:** `src/app/marks.tsx`, `src/mock/exams.ts`, `src/mock/marks.ts`, `src/types/models.ts` (`Exam`, `Mark`).
- **Existing Functionality:** Read-only list of 4 students with maths, science, english marks and average calculations.
- **Missing Functionality:**
  - Exam creation & schedule management (Mid-term, Final, Unit tests).
  - Teacher mark entry matrix by Class + Exam + Subject.
  - Input validation: marks between 0 and `max_marks`.
  - Student report card view with grade computation (A+, A, B, C, F) and teacher remarks.
  - Parent view of their children's report cards.
- **Backend Requirement:** `/api/v1/exams`, `/api/v1/marks/entry-batch`, `/api/v1/marks/student/{student_id}`.
- **Database Requirement:** `exams` table (`id`, `name`, `term`, `academic_year`, `start_date`, `end_date`), `exam_subjects` (`exam_id`, `subject_id`, `max_marks`, `passing_marks`, `exam_date`), `marks` (`student_id`, `exam_id`, `subject_id`, `marks_obtained`, `grade`, `remarks`).
- **Frontend Requirement:** Teacher grade entry interface; Student / Parent result & report card screen in `/students/academics` and `/parents/children`.
- **Security Requirement:** Validation against negative or out-of-bounds marks; only assigned teachers can input marks.
- **Testing Requirement:** Grade calculation unit tests, out-of-bounds marks rejection test, student report card query test.
- **Estimated Completion %:** **25%** (Target: **70–80%**)

---

### PHASE 09 — Events + Notifications
- **Current Status:** Mock Data / Component Complete.
- **Existing Files:** `src/components/EventCard.tsx`, `src/mock/events.ts`, `src/mock/announcements.ts`, `src/app/students/events.tsx` (placeholder).
- **Existing Functionality:** Reusable `EventCard` component with date, time, location, badge; rendered inside dashboards.
- **Missing Functionality:**
  - Dedicated Events & Notice Board screen (`/students/events`, `/teacher/events`, `/parents/events`).
  - Event filter by type (Academic, Sports, Cultural, Holiday).
  - In-app notification inbox modal or screen with read/unread indicators.
  - Event creation flow for school administrators.
- **Backend Requirement:** `/api/v1/events`, `/api/v1/notifications/my-notifications`, `/api/v1/notifications/{id}/read`.
- **Database Requirement:** `events` (`id`, `title`, `description`, `date`, `time`, `location`, `type`, `audience`), `notifications` (`id`, `user_id`, `title`, `body`, `is_read`, `created_at`).
- **Frontend Requirement:** Dedicated Events screen with tabs for "Upcoming" and "Past", Notification sheet triggered by header bell icon.
- **Security Requirement:** Audience targeting (e.g., teachers-only announcements hidden from students).
- **Testing Requirement:** Target audience filtering test, notification read status update test.
- **Estimated Completion %:** **35%** (Target: **65–75%**)

---

### PHASE 10 — Chat Foundation
- **Current Status:** Placeholders (`chat.tsx` in students, teacher, parents).
- **Existing Files:** `src/app/students/chat.tsx`, `src/app/teacher/chat.tsx`, `src/app/parents/chat.tsx`.
- **Existing Functionality:** Placeholder ("Coming Soon").
- **Missing Functionality:**
  - Conversation list screen (Teacher ↔ Parent, Student ↔ Teacher).
  - Direct message thread view with bubbles, timestamps, sender info.
  - Backend message persistence and conversation creation.
- **Backend Requirement:** `/api/v1/chat/conversations`, `/api/v1/chat/conversations/{id}/messages`, `POST` message endpoint.
- **Database Requirement:** `conversations` (`id`, `type`, `created_at`), `conversation_participants` (`conversation_id`, `user_id`), `messages` (`id`, `conversation_id`, `sender_id`, `content`, `sent_at`, `is_read`).
- **Frontend Requirement:** Conversation list screen + message thread screen with text input, send button, and bubble layouts.
- **Security Requirement:** Participant authorization: users can only fetch messages from conversations they belong to.
- **Testing Requirement:** Conversation creation test, unauthorized message access rejection test.
- **Estimated Completion %:** **5%** (Target: **50–65%**)

---

### PHASE 11 — Finance Foundation
- **Current Status:** Mock Data / Placeholder.
- **Existing Files:** `src/mock/fees.ts`, `src/app/parents/fees.tsx` (placeholder), `src/types/models.ts` (`Fee`).
- **Existing Functionality:** Mock fee items displayed in Parent Dashboard fee section.
- **Missing Functionality:**
  - Dedicated Parent Fees screen showing breakdown (Tuition, Transport, Lab), due dates, and payment history.
  - Status badges (`PAID`, `PENDING`, `OVERDUE`).
  - Receipt generation / invoice record view.
  - Mock payment simulation workflow with confirmation modal.
- **Backend Requirement:** `/api/v1/finance/fees/student/{student_id}`, `/api/v1/finance/pay-mock`.
- **Database Requirement:** `fee_categories` (`id`, `name`), `fee_invoices` (`id`, `student_id`, `title`, `amount`, `due_date`, `status`), `payments` (`id`, `invoice_id`, `amount_paid`, `payment_method`, `transaction_reference`, `paid_at`).
- **Frontend Requirement:** Comprehensive Fees screen in `/parents/fees` with payment history tab and simulated payment action.
- **Security Requirement:** Parents may only inspect fee records for their verified children.
- **Testing Requirement:** Fee status transition tests (pending → paid), payment record validation.
- **Estimated Completion %:** **15%** (Target: **50–60%**)

---

### PHASES 12–20 — Advanced Modules Foundation
- **Phase 12 (Food Court):** Menu display, daily meal schedule, allergy info. (Target: **30–40%**)
- **Phase 13 (Transport):** Bus route display, driver contact, pickup/drop-off stop info. (Target: **25–35%**)
- **Phase 14 (Library):** Book catalog search, borrowed books, due dates. (Target: **25–35%**)
- **Phase 15 (Timesheet & Leave):** Teacher leave request submission, leave balance. (Target: **25–35%**)
- **Phase 16 (File Management):** Study material & syllabus download lists. (Target: **25–35%**)
- **Phase 17 (Hostel):** Room allocation details, warden contacts. (Target: **20–30%**)
- **Phase 18 (Inventory):** School assets catalog and lab equipment records. (Target: **20–30%**)
- **Phase 19 (HR & Performance):** Teacher evaluations & payroll stubs. (Target: **20–30%**)
- **Phase 20 (Analytics):** School-wide analytics cards (Attendance trends, Grade distributions, Fee recovery rates). (Target: **40–50%**)

---

## 3. Summary of Core Gaps

1. **Architecture Gap:** Front-end has zero connectivity to an API backend; no backend code currently exists.
2. **Persistence Gap:** All changes (such as attendance toggles or adding students) are purely transient in React local state.
3. **Security Gap:** Authentication relies on client-side timeouts; role navigation can be bypassed; no tokens or password verification exist.
4. **Reliability Gap:** Zero automated tests exist across the entire stack.
5. **Quality & Usability Gap:** Multiple tabs simply render "Coming Soon"; tab icons are blank fragments.
