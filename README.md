# School Management System

A full-stack school management system built with React Native (Expo) and FastAPI.

## Architecture

```
Frontend (React Native / Expo / TypeScript)
    ↓ HTTPS  (EXPO_PUBLIC_API_BASE_URL)
FastAPI REST API  (Render Web Service)
    ↓ JWT + RBAC authorization
Service Layer  →  Repository Layer
    ↓ SQLAlchemy ORM
PostgreSQL (Production) / SQLite (Development)
```

## Features

| Module | Status | Notes |
|--------|--------|-------|
| Authentication (JWT + Refresh) | ✅ | Access + refresh tokens, bcrypt hashing |
| RBAC (User → Role → Permissions) | ✅ | 27 granular permissions |
| Record Ownership Authorization | ✅ | Students/parents see only their own data |
| User Management | ✅ | Admin CRUD, activation/deactivation |
| Classes + Subjects | ✅ | CRUD, enrollment management |
| Timetable | ✅ | CRUD + conflict detection, Mon–Sat |
| Attendance | ✅ | Mark, history, date-range filter, summaries |
| Marks + Exams | ✅ | Exam CRUD, mark entry, auto grade calculation |
| Events + Notifications | ✅ | CRUD, mark-as-read |
| Chat (REST) | ✅ | Conversations + message history (polling) |
| Finance | ✅ | Invoices, payments (simulated/sandbox) |
| Dashboards | ✅ | Role-aware: Admin, Teacher, Student, Parent |
| Analytics | ✅ | Enrollment, attendance, finance overview |
| Food Court | ✅ | Menu, cart, orders, tracking |
| Transport | ✅ | Routes, stops, student assignments |
| Library | ✅ | Books, issue/return, fine calculation |
| Leave Management | ✅ | Types, apply, approve/reject workflow |

---

## Local Development

### Prerequisites
- Node.js 18+, npm
- Python 3.11+

### Frontend
```bash
cd school-management
npm install
npm run web          # Expo dev server on http://localhost:8081
```

### Backend
```bash
cd school-management/backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # Edit .env with your settings

alembic upgrade head   # Apply schema migrations
uvicorn app.main:app --reload  # API on http://localhost:8000
```

**Default `.env` for local dev (SQLite is fine):**
```env
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=sqlite:///./school.db
JWT_SECRET_KEY=dev-secret-change-me
CORS_ORIGINS=http://localhost:8081,http://localhost:3000
```

---

## Production Deployment

The system deploys as two independent services:

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | **Vercel** | `https://your-app.vercel.app` |
| Backend API | **Render** | `https://school-api.onrender.com` |
| Database | **Render PostgreSQL** | Internal connection |

---

### Step 1 — Deploy Backend to Render

#### 1.1 Create the Web Service

1. Go to [render.com](https://render.com) → **New → Web Service**.
2. Connect your GitHub repository.
3. Set:
   - **Root Directory**: `school-management/backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Runtime**: Python 3

   > **Tip**: If you use the [render.yaml](file:///c:/Users/madem/OneDrive/Desktop/min%20projects/school-management/backend/render.yaml) Blueprint, Render pre-fills most of this automatically.

#### 1.2 Add PostgreSQL

1. In the Render dashboard, click **New → PostgreSQL**.
2. Give it a name (e.g. `school-db`) and create it.
3. Copy the **Internal Database URL**.
4. Paste it as `DATABASE_URL` in the Web Service's **Environment** tab.

#### 1.3 Set Environment Variables (Render → Environment tab)

| Variable | Value |
|---|---|
| `ENVIRONMENT` | `production` |
| `DEBUG` | `false` |
| `DATABASE_URL` | Internal PostgreSQL URL from step 1.2 |
| `JWT_SECRET_KEY` | Run `python -c "import secrets; print(secrets.token_hex(64))"` locally |
| `CORS_ORIGINS` | Your Vercel URL (set after Step 2, then redeploy) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` (optional) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` (optional) |

#### 1.4 Run Database Migrations

After the first successful deploy, open the Render **Shell** tab and run:

```bash
alembic upgrade head
```

> ⚠️ **Do not run `seed.py` in production.** The seed script creates demo users and is for local development only. Use the admin UI or a separate migration to create your first production admin account.

#### 1.5 Verify

```
GET https://school-api.onrender.com/health
```
Expected response:
```json
{ "status": "ok", "environment": "production", "database": { "status": "ok", "backend": "postgresql" } }
```

---

### Step 2 — Deploy Frontend to Vercel

#### 2.1 Import the Repository

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**.
2. Import your GitHub repository.
3. Set **Root Directory** to `school-management` (the folder containing `package.json`).
4. Vercel will detect [`vercel.json`](file:///c:/Users/madem/OneDrive/Desktop/min%20projects/school-management/vercel.json) automatically.
   - **Install**: `npm install`
   - **Build**: `npx expo export -p web`
   - **Output**: `dist`

#### 2.2 Set Environment Variables (Vercel → Project Settings → Environment Variables)

| Variable | Value |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | `https://school-api.onrender.com/api/v1` |

> The `EXPO_PUBLIC_` prefix is Expo's convention for build-time variables that are safely bundled into client code. Do **not** put secrets here.

#### 2.3 Deploy and Note the URL

After deploy, Vercel gives you a URL like `https://school-management-abc.vercel.app`.

#### 2.4 Update Backend CORS (complete the loop)

1. Go back to **Render → Web Service → Environment**.
2. Set `CORS_ORIGINS` to your Vercel domain: `https://school-management-abc.vercel.app`
3. Click **Save Changes** — Render redeploys automatically.

---

## API Documentation

Swagger UI is available only when `DEBUG=true`:
- `http://localhost:8000/docs` (local dev)

Docs are disabled in production for security.

## Testing

### Backend
```bash
cd backend
pytest tests/ -v         # 79 tests
```

### Frontend TypeScript
```bash
npx tsc --noEmit
```

### Local Expo web export (smoke test for the Vercel build)
```bash
npx expo export -p web   # output goes to dist/
```

---

## Authentication

All endpoints except `/health` and `POST /api/v1/auth/login` require:
```http
Authorization: Bearer <access_token>
```

Obtain tokens via `POST /api/v1/auth/login`. Refresh via `POST /api/v1/auth/refresh`.

---

## RBAC

| Role | Description |
|------|-------------|
| admin | Full access (wildcard bypass) |
| teacher | Teaching operations (marks, attendance, timetable) |
| student | Own records only (attendance, marks, finance) |
| parent | Children's records only (via parent_students table) |
| staff | Limited operational access |

---

## Limitations & Honest Notes

- **Payments**: All payment processing is **SANDBOX/SIMULATED**. No real money is transferred.
- **Chat**: REST polling-based. Not real-time WebSocket push.
- **File Storage**: Local filesystem metadata only. Configure an S3-compatible bucket for production.
- **Transport**: Route management only. No live GPS tracking.

## License

MIT
