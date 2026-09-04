"""
Repositories package — Data access layer.

Architecture: Router → Service → Repository → DB

Repositories encapsulate all SQLAlchemy queries and database interactions.
They receive a Session from FastAPI's dependency injection, perform CRUD
operations, and return domain model objects or None. They must never
contain business logic — that belongs in Services.
"""
