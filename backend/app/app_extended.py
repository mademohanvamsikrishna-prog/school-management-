"""
app_extended.py — Extended FastAPI entrypoint that adds new routers
to the existing app WITHOUT modifying main.py.

Usage (replace uvicorn main:app with):
    uvicorn app.app_extended:app

This module imports the existing app from main.py and registers
the new teacher router on the already-mounted api_v1_router prefix.
"""
from app.main import app, api_v1_router
from app.routers import teacher as teacher_router
from app.routers.admin_extended import router as admin_extended_router

# Register new teacher endpoints at /api/v1/teacher/...
api_v1_router.include_router(teacher_router.router)

# Register extended admin endpoints at /api/v1/admin/...
api_v1_router.include_router(admin_extended_router)

# Re-export app so uvicorn can find it
__all__ = ["app"]
