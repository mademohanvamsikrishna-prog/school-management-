"""
Routers package — API endpoint handlers.

Architecture: Router → Service → Repository → DB

Routers receive HTTP requests, validate input via Pydantic schemas,
delegate business logic to Services, and return HTTP responses.

Each module domain (students, teachers, etc.) will have its own router
registered on the v1 API router in main.py.
"""
