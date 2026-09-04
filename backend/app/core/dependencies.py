"""
FastAPI dependencies for authentication and authorization.

Usage:
    # Require any authenticated user
    @router.get("/me")
    def me(current_user: User = Depends(get_current_user)):
        ...

    # Require a specific permission
    @router.post("/attendance")
    def mark_attendance(
        _: User = Depends(require_permission("attendance:mark")),
    ):
        ...

    # Require any of several permissions (OR logic)
    @router.get("/report")
    def report(
        _: User = Depends(require_any_permission("marks:read", "marks:write")),
    ):
        ...
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User
from app.repositories import user_repository

# ---------------------------------------------------------------------------
# Bearer token extractor
# ---------------------------------------------------------------------------

_bearer = HTTPBearer(auto_error=False)


def _extract_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> str:
    """
    Extract the raw Bearer token from the Authorization header.
    Raises 401 if header is missing or not Bearer scheme.
    """
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Provide a Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials


# ---------------------------------------------------------------------------
# get_current_user dependency
# ---------------------------------------------------------------------------

def get_current_user(
    raw_token: str = Depends(_extract_token),
    db: Session = Depends(get_db),
) -> User:
    """
    Decode the JWT, load the user from DB, and assert the account is active.
    Raises HTTP 401 on any token failure, 403 if account is inactive.
    """
    try:
        payload = decode_token(raw_token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_type: str = payload.get("type", "")
    if token_type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token subject is missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = user_repository.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled.",
        )

    return user


# ---------------------------------------------------------------------------
# Permission-based authorization factories
# ---------------------------------------------------------------------------

def require_permission(permission_code: str):
    """
    Dependency factory — requires the authenticated user to have a specific permission.

    Admin role bypasses all permission checks (wildcard grant).

    Example:
        Depends(require_permission("attendance:mark"))
    """
    def _check(current_user: User = Depends(get_current_user)) -> User:
        if not current_user.has_permission(permission_code):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: '{permission_code}' is required.",
            )
        return current_user

    # Give the inner function a unique name for FastAPI's dependency cache
    _check.__name__ = f"require_{permission_code.replace(':', '_')}"
    return _check


def require_any_permission(*permission_codes: str):
    """
    Dependency factory — requires the user to have AT LEAST ONE of the given permissions.

    Example:
        Depends(require_any_permission("marks:read", "marks:write"))
    """
    def _check(current_user: User = Depends(get_current_user)) -> User:
        if not any(current_user.has_permission(p) for p in permission_codes):
            codes = ", ".join(f"'{p}'" for p in permission_codes)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: one of {codes} is required.",
            )
        return current_user

    _check.__name__ = f"require_any_{'_or_'.join(p.replace(':', '_') for p in permission_codes)}"
    return _check
