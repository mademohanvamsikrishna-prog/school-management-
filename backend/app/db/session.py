from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Enforce production database policy before establishing engine
settings.enforce_production_database()

is_sqlite = settings.DATABASE_URL.startswith("sqlite")

# SQLAlchemy 2.x maps plain 'postgresql://' to psycopg (v3).
# We only have psycopg2-binary, so rewrite the scheme to be explicit.
def _make_db_url(url: str) -> str:
    if url.startswith("postgresql://") and not url.startswith("postgresql+"):
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url

db_url = _make_db_url(settings.DATABASE_URL)
engine_kwargs = {}
if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(
    db_url,
    echo=settings.DEBUG,
    **engine_kwargs,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
