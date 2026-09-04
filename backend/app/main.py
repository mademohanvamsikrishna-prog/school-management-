"""
School Management System — FastAPI Application Entry Point

Architecture: Router → Service → Repository → DB

API versioning:
    /api/v1/...   — Version 1 routes (current)

Available endpoints:
    GET /         — Root redirect info
    GET /health   — Health check (uptime, environment, db status)

Future endpoints (Priority 3+):
    POST /api/v1/auth/login
    POST /api/v1/auth/refresh
    GET  /api/v1/auth/me
    GET  /api/v1/students/
    GET  /api/v1/teachers/
    ...
"""
import time
from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings

# ---------------------------------------------------------------------------
# API v1 router — domain routers are registered here as they are implemented.
# ---------------------------------------------------------------------------
from fastapi import APIRouter
from app.routers import auth as auth_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth_router.router)

# ---------------------------------------------------------------------------
# Startup / shutdown lifecycle
# ---------------------------------------------------------------------------

_startup_time: float = 0.0


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: runs startup logic, then yields, then shutdown."""
    global _startup_time
    _startup_time = time.time()

    print(
        f"[{settings.APP_NAME}] Starting up | "
        f"environment={settings.ENVIRONMENT} | "
        f"debug={settings.DEBUG}"
    )

    # Enforce production DB policy at startup
    settings.enforce_production_database()

    yield

    print(f"[{settings.APP_NAME}] Shutting down.")


# ---------------------------------------------------------------------------
# FastAPI app factory
# ---------------------------------------------------------------------------

def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "School Management System REST API. "
            "Provides endpoints for student, teacher, parent, attendance, "
            "marks, timetable, finance, and communication management."
        ),
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        openapi_url="/openapi.json" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    # -----------------------------------------------------------------------
    # CORS Middleware
    # -----------------------------------------------------------------------
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept", "X-Request-ID"],
    )

    # -----------------------------------------------------------------------
    # Mount API v1 router
    # (domain-specific routers will be included in api_v1_router in Priority 3+)
    # -----------------------------------------------------------------------
    application.include_router(api_v1_router)

    return application


app = create_application()


# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------

@app.get("/", include_in_schema=False)
async def root() -> Dict[str, Any]:
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
        "api": "/api/v1",
    }


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get(
    "/health",
    tags=["System"],
    summary="Health check",
    description=(
        "Returns the operational status of the API server, current environment, "
        "database connectivity, and uptime. This endpoint does NOT require authentication."
    ),
)
async def health_check() -> JSONResponse:
    from sqlalchemy import text
    from app.db.session import engine

    # Test database connection
    db_status = "ok"
    db_error: str | None = None
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = "error"
        db_error = str(exc)

    uptime_seconds = round(time.time() - _startup_time, 2) if _startup_time else 0.0

    payload: Dict[str, Any] = {
        "status": "ok" if db_status == "ok" else "degraded",
        "environment": settings.ENVIRONMENT,
        "version": settings.APP_VERSION,
        "uptime_seconds": uptime_seconds,
        "database": {
            "status": db_status,
            "backend": (
                "postgresql"
                if settings.DATABASE_URL.startswith("postgresql")
                else "sqlite"
            ),
        },
    }

    if db_error:
        payload["database"]["error"] = db_error

    status_code = 200 if db_status == "ok" else 503
    return JSONResponse(content=payload, status_code=status_code)
