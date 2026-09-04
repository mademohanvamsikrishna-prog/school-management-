"""
Services package — Business logic layer.

Architecture: Router → Service → Repository → DB

Services contain all domain business logic. They are called by Routers
and call Repositories for data access. Services must not contain raw
SQL or direct SQLAlchemy queries — those belong in Repositories.
"""
