# School Management System — Backend

FastAPI backend for the School Management System.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Web framework | FastAPI 0.110+ |
| ORM | SQLAlchemy 2.0 (declarative, typed `Mapped`) |
| Migrations | Alembic |
| Authentication | JWT (PyJWT + passlib/bcrypt) |
| Database (dev) | SQLite |
| Database (prod) | **PostgreSQL (mandatory)** |
| Settings | pydantic-settings |
| Testing | pytest + httpx |

---

## Architecture

```
HTTP Request
    └─→ Router      (app/routers/)      — HTTP handling, input validation
         └─→ Service    (app/services/)     — Business logic
              └─→ Repository (app/repositories/) — Data access (SQLAlchemy)
                   └─→ Database (SQLite / PostgreSQL)
```

Pydantic schemas (`app/schemas/`) define the shape of request/response data.  
SQLAlchemy models (`app/models/`) define the database schema.

---

## Prerequisites

- Python 3.11+
- `pip` or another Python package manager

---

## Quick Start (Development)

### 1. Create and activate the virtual environment

```bash
cd backend
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
# Copy the template
cp .env.example .env

# Edit .env — for development you can leave DATABASE_URL as SQLite
```

### 4. Run database migrations

```bash
alembic upgrade head
```

### 5. Seed development data

```bash
# Windows (PowerShell) — must set PYTHONPATH to the backend root
$env:PYTHONPATH = "."; python app/db/seed.py

# macOS / Linux
PYTHONPATH=. python app/db/seed.py
```

Seed creates the following demo accounts (password: `password123`):

| Email | Role |
|-------|------|
| admin@school.edu | Admin |
| teacher@school.edu | Teacher |
| student@school.edu | Student |
| parent@school.edu | Parent |

### 6. Start the FastAPI server

```bash
# Windows (PowerShell)
$env:PYTHONPATH = "."; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# macOS / Linux
PYTHONPATH=. uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

| URL | Description |
|-----|-------------|
| http://localhost:8000 | Root info |
| http://localhost:8000/health | Health check |
| http://localhost:8000/docs | Swagger UI (dev only) |
| http://localhost:8000/redoc | ReDoc (dev only) |
| http://localhost:8000/api/v1 | API v1 base |

---

## Database Rules

### Development / Testing
SQLite is permitted. It requires no external setup and is used by default.

```env
DATABASE_URL=sqlite:///./school.db
ENVIRONMENT=development
```

### Production
**PostgreSQL is strictly required.** The application calls `settings.enforce_production_database()`
at startup and will raise a `RuntimeError` and refuse to start if `DATABASE_URL` is not a
PostgreSQL URL when `ENVIRONMENT=production`.

```env
DATABASE_URL=postgresql+psycopg2://user:password@host:5432/school_db
ENVIRONMENT=production
DEBUG=false
```

---

## Alembic Migrations

All schema changes MUST be tracked via Alembic migrations. Do NOT use
`Base.metadata.create_all()` in production — use migrations only.

```bash
# Generate a new migration after changing a model
alembic revision --autogenerate -m "description_of_change"

# Apply all pending migrations
alembic upgrade head

# Roll back one migration
alembic downgrade -1

# Roll back to the very beginning (empty database)
alembic downgrade base

# Show migration history
alembic history --verbose

# Show current database version
alembic current
```

---

## Running Tests

```bash
# Windows
$env:PYTHONPATH = "."; pytest

# macOS / Linux
PYTHONPATH=. pytest
```

Tests use SQLite automatically (via `ENVIRONMENT=testing`).

---

## Security Notes

- Never commit `.env` — it is in `.gitignore`.
- Change `JWT_SECRET_KEY` to a random 64-character hex string in production.
- `DEBUG=true` exposes `/docs`, `/redoc`, and `/openapi.json` — set `DEBUG=false` in production.
- Finance payments are **simulated only**. No real payment gateway is integrated.
- Chat messaging uses a REST API foundation. WebSocket/real-time support is planned for a future milestone.
