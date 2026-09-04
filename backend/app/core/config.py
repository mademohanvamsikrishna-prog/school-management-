import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "School Management System API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"  # "development", "testing", "production"
    DEBUG: bool = True

    # Security
    JWT_SECRET_KEY: str = "super-secret-dev-key-change-in-production-1234567890"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    # Default is SQLite for local development and test automation.
    # In production, PostgreSQL is strictly enforced.
    DATABASE_URL: str = "sqlite:///./school.db"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:8081",
        "http://localhost:19006",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:8000",
        "*",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str, info) -> str:
        # Check environment from data if available or os.environ
        return v

    def enforce_production_database(self) -> None:
        """
        Enforce that PostgreSQL is mandatory for production.
        SQLite is allowed ONLY for local development and automated testing.
        Never silently fall back to SQLite in production.
        """
        is_production = self.ENVIRONMENT.lower() in ("production", "prod")
        is_postgres = (
            self.DATABASE_URL.startswith("postgresql://")
            or self.DATABASE_URL.startswith("postgresql+psycopg2://")
            or self.DATABASE_URL.startswith("postgresql+asyncpg://")
        )
        if is_production and not is_postgres:
            raise RuntimeError(
                f"CRITICAL CONFIGURATION ERROR: PostgreSQL is strictly required in production mode. "
                f"Configured DATABASE_URL is '{self.DATABASE_URL}'. SQLite is only permitted in "
                f"development and test environments."
            )


settings = Settings()
settings.enforce_production_database()
