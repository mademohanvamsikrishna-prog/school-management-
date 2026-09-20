import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "School Management System API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"  # "development" | "testing" | "production"
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
    # In development the field defaults to localhost ports.
    # In production, set CORS_ORIGINS as a comma-separated string of allowed origins
    # in the Render environment dashboard, e.g.:
    #   CORS_ORIGINS=https://yourapp.vercel.app,https://yourapp.com
    #
    # DO NOT use "*" — it is incompatible with allow_credentials=True (CORS spec).
    CORS_ORIGINS: Union[str, List[str]] = (
        # ── Production frontend (always allowed) ──────────────────────────
        "https://school-management-smoky-six.vercel.app,"
        "https://school-management-git-main-mademohanvamsikrishna-8090.vercel.app,"
        # ── Local development ─────────────────────────────────────────────
        "http://localhost:8081,"
        "http://localhost:19006,"
        "http://localhost:5173,"
        "http://localhost:3000,"
        "http://localhost:8000,"
        "http://127.0.0.1:8081,"
        "http://127.0.0.1:8000"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """
        Accept CORS_ORIGINS as:
          - A comma-separated string: "https://a.com,https://b.com"
          - A Python list (when set programmatically in tests)

        Strips whitespace and filters empty entries.
        Never allows "*" — wildcard + credentials violates the CORS spec and
        is rejected by all modern browsers.
        """
        if isinstance(v, list):
            origins = v
        else:
            origins = [o.strip() for o in v.split(",") if o.strip()]

        for origin in origins:
            if origin == "*":
                raise ValueError(
                    "Wildcard '*' is not permitted in CORS_ORIGINS when "
                    "allow_credentials=True. Specify explicit origins instead."
                )
        return origins

    def get_cors_origins(self) -> List[str]:
        """
        Return the parsed CORS origins list.
        In production, only explicitly configured origins are returned.
        In development/testing, localhost entries are always included for convenience.
        """
        origins: List[str] = (
            self.CORS_ORIGINS
            if isinstance(self.CORS_ORIGINS, list)
            else [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
        )

        is_prod = self.ENVIRONMENT.lower() in ("production", "prod")
        if not is_prod:
            # Ensure local dev origins are always present in non-production
            local_origins = [
                "http://localhost:8081",
                "http://localhost:19006",
                "http://localhost:3000",
                "http://localhost:8000",
                "http://127.0.0.1:8081",
                "http://127.0.0.1:8000",
            ]
            for lo in local_origins:
                if lo not in origins:
                    origins.append(lo)

        return origins

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
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
