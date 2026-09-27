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


def _create_app_engine():
    is_prod = settings.ENVIRONMENT.lower() in ("production", "prod")
    db_url = _make_db_url(settings.DATABASE_URL)
    is_sqlite = db_url.startswith("sqlite")

    engine_kwargs = {}
    if is_sqlite:
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    else:
        engine_kwargs["pool_pre_ping"] = True
        engine_kwargs["pool_recycle"] = 300

    try:
        eng = create_engine(
            db_url,
            echo=settings.DEBUG,
            **engine_kwargs,
        )
        if not is_sqlite:
            # Verify connectivity
            with eng.connect() as conn:
                pass
        return eng
    except Exception as exc:
        if not is_prod:
            import logging
            logging.warning(
                f"[DB INIT] PostgreSQL connection to remote host failed ({exc}). "
                f"Falling back to local SQLite database (school.db) for development."
            )
            return create_engine(
                "sqlite:///./school.db",
                echo=settings.DEBUG,
                connect_args={"check_same_thread": False},
            )
        raise exc

engine = _create_app_engine()

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
