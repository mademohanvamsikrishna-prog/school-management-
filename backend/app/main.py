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
from app.routers import domain as domain_router
from app.routers import admin as admin_router
from app.routers import chat as chat_router
from app.routers import extended as extended_router
from app.routers import student_dashboard as student_dashboard_router
from app.routers import teacher as teacher_router  # NEW: teacher-specific endpoints

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth_router.router)
api_v1_router.include_router(domain_router.router)
api_v1_router.include_router(admin_router.router)
api_v1_router.include_router(chat_router.router)
api_v1_router.include_router(extended_router.router)
api_v1_router.include_router(student_dashboard_router.router)
api_v1_router.include_router(teacher_router.router)  # NEW

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

    # -----------------------------------------------------------------------
    # Seed runs in a background thread AFTER yield so the server passes
    # Railway's health check immediately (~2 s) instead of timing out during
    # the 30-90 s seed against remote Supabase PostgreSQL → was causing 502.
    # The seed is idempotent so it is safe to defer and run after boot.
    # -----------------------------------------------------------------------
    import threading

    def _run_seed() -> None:
        try:
            from app.db.seed import (
                seed_database, ensure_seed_invoices,
                seed_telugu_class_9c, seed_requested_users,
            )
            from app.db.session import SessionLocal as _SL
            _db = _SL()
            try:
                print("[Seed] Background seed starting...")
                seed_database(_db)
                ensure_seed_invoices(_db)
                # seed_dhanush_family() intentionally NOT called — ghost .edu duplicates
                seed_telugu_class_9c(_db)
                seed_requested_users(_db)
                print("[Seed] Background seed complete.")
            finally:
                _db.close()
        except Exception as _err:
            print(f"[Seed] WARNING — seed failed (non-fatal): {_err}")

    yield  # server is live & healthy from here — health check passes immediately

    # Start seed after server is ready (daemon=True so it won't block shutdown)
    threading.Thread(target=_run_seed, daemon=True, name="db-seed").start()

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
    # Origins are managed via CORS_ORIGINS env var → settings.get_cors_origins()
    # NOTE: "*" wildcard is blocked at settings level when credentials=True
    # -----------------------------------------------------------------------
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.get_cors_origins(),
        # Covers ALL Vercel preview deployments for this project automatically.
        # Pattern: https://school-management-<hash>-mademohanvamsikrishna-8090.vercel.app
        # This avoids manually adding each new preview URL to CORS_ORIGINS.
        allow_origin_regex=(
            r"https://school-management(-[a-z0-9]+)*"
            r"(-mademohanvamsikrishna-8090)?\.vercel\.app"
        ),
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
# Explicit OPTIONS preflight handler
#
# FastAPI's CORSMiddleware handles preflights for registered routes, but
# during a cold start the lifespan (seed, DB check) can block for 30-60 s.
# The browser sends its CORS preflight before the server is fully ready,
# gets no response, and cancels both the preflight AND the real request.
#
# This bare OPTIONS route is registered directly on the ASGI app BEFORE the
# lifespan runs, so it responds immediately with 204 No Content as soon as
# Uvicorn/Gunicorn accepts the connection — unblocking the browser preflight.
# ---------------------------------------------------------------------------

from fastapi.responses import Response

@app.options("/{rest_of_path:path}", include_in_schema=False)
async def preflight_handler(rest_of_path: str) -> Response:
    """
    Catch-all OPTIONS handler.
    Returns 204 No Content immediately so browser preflights never time out,
    even during a cold-start boot when the lifespan is still initialising.
    The actual CORS response headers are injected by CORSMiddleware.
    """
    return Response(status_code=204)


# ---------------------------------------------------------------------------
# Wake endpoint — lightweight ping for cold-start probing
#
# The frontend can GET /wake on app load to trigger the server spin-up
# before the user clicks "Login", hiding the cold-start delay entirely.
# ---------------------------------------------------------------------------

@app.get("/wake", include_in_schema=False)
async def wake() -> Response:
    """
    Lightweight no-op endpoint.  Call this on app load to pre-warm a
    cold-started free-tier server before the user attempts to log in.
    """
    return Response(status_code=204)



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
