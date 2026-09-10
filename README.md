# School Management System

A full-stack school management system built with React Native (Expo) and FastAPI.

## Architecture

```
Frontend (React Native/Expo/TypeScript)
    ↓ HTTPS
FastAPI REST API
    ↓ Authorization (JWT + RBAC)
Service Layer
    ↓ Business Logic
Repository Layer
    ↓ SQLAlchemy ORM
PostgreSQL (Production) / SQLite (Development)
```

## Features

| Module | Status | Notes |
|--------|--------|-------|
| Authentication (JWT + Refresh) | ✅ | Access + refresh tokens, bcrypt hashing |
| RBAC (User → Role → Permissions) | ✅ | 27 granular permissions |
| User Management | ✅ | Admin CRUD, activation/deactivation |
| Classes + Subjects | ✅ | CRUD, enrollment management |
| Timetable | ✅ | CRUD + teacher/class conflict detection |
| Attendance | ✅ | Mark, history, date-range filter, summaries |
| Marks + Exams | ✅ | Exam CRUD, mark entry, auto grade calculation |
| Events + Notifications | ✅ | CRUD, mark-as-read |
| Chat (REST) | ✅ | Conversations + message history (polling) |
| Finance | ✅ | Invoices, payments (explicitly simulated/sandbox) |
| Dashboards | ✅ | Role-aware: Admin, Teacher, Student, Parent |
| Analytics | ✅ | Enrollment, attendance, finance overview |
| Food Court | ✅ | Menu, cart, orders, order tracking |
| Transport | ✅ | Routes, stops, student assignments |
| Library | ✅ | Books, issue/return, fine calculation |
| Leave Management | ✅ | Types, apply, approve/reject workflow |
| Hostel | ✅ | Rooms, beds, student allocations |
| Inventory | ✅ | Items, stock movements, low-stock alerts |
| HR + Performance | ✅ | Departments, performance reviews |
| File Management | ✅ | Metadata layer (local filesystem storage) |

## Quick Start

### Prerequisites
- Node.js 18+, npm
- Python 3.11+
- PostgreSQL (production) or SQLite (development)

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your settings

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

### Environment Variables (backend/.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/school_db
JWT_SECRET_KEY=your-very-secure-secret-key-change-in-production
ENVIRONMENT=development
```

> **Production** requires `DATABASE_URL` to start with `postgresql://`. The server will refuse to start with SQLite in production.

## API Documentation

When running with `DEBUG=true`, Swagger UI is available at:
- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

Full API reference: [docs/API.md](docs/API.md)

## Testing

### Backend
```bash
cd backend
pytest tests/ -v
```

### Frontend TypeScript
```bash
npx tsc --noEmit
```

## Authentication

All API endpoints (except `/health` and `POST /api/v1/auth/login`) require a Bearer token:

```http
Authorization: Bearer <access_token>
```

Obtain tokens via `POST /api/v1/auth/login`. Refresh tokens via `POST /api/v1/auth/refresh`.

## RBAC

| Role | Description |
|------|-------------|
| admin | Full access (wildcard bypass) |
| teacher | Teaching operations (marks, attendance, timetable) |
| student | Read-only student data |
| parent | Read-only parent/child data |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full permissions matrix.

## Production Deployment

> See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for deployment checklist.

Key requirements:
1. `ENVIRONMENT=production` → PostgreSQL enforced
2. Strong `JWT_SECRET_KEY` (min 32 chars, randomly generated)
3. HTTPS termination at load balancer
4. Reverse proxy (nginx/caddy) in front of uvicorn

## Limitations & Honest Notes

- **Payments**: All payment processing is **SANDBOX/SIMULATED**. No real money is transferred. `payment_method` is explicitly set to `simulated_sandbox`.
- **Chat**: REST polling-based. Not real-time WebSocket push (requires Redis/message broker).
- **File Storage**: Local filesystem only. For production, configure an S3-compatible bucket and update `FileRecord.storage_path` accordingly.
- **Transport**: Route management only. No live GPS tracking.

## License

MIT
