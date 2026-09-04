"""
Auth router — /api/v1/auth endpoints.

POST /auth/login    → Exchange email+password for access+refresh tokens.
GET  /auth/me       → Return the authenticated user's profile (requires Bearer token).
POST /auth/refresh  → Rotate a refresh token to get new access+refresh pair.
POST /auth/logout   → Revoke the provided refresh token.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RefreshRequest, TokenResponse, UserMeResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login",
    description=(
        "Authenticate with email and password. Returns a JWT access token "
        "(short-lived) and an opaque refresh token (long-lived). "
        "Inactive accounts are rejected with HTTP 403."
    ),
)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return auth_service.login(db, email=payload.email, password=payload.password)


@router.get(
    "/me",
    response_model=UserMeResponse,
    status_code=status.HTTP_200_OK,
    summary="Current user profile",
    description=(
        "Return the profile of the currently authenticated user. "
        "Password hash is never included in the response."
    ),
)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserMeResponse:
    return auth_service.get_me(db, current_user.id)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description=(
        "Exchange a valid refresh token for a new access + refresh token pair. "
        "The old refresh token is immediately revoked (token rotation). "
        "Expired or revoked tokens return HTTP 401."
    ),
)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return auth_service.refresh_tokens(db, raw_refresh_token=payload.refresh_token)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout",
    description="Revoke the provided refresh token, effectively ending the session.",
)
def logout(payload: RefreshRequest, db: Session = Depends(get_db)) -> None:
    from app.repositories import user_repository
    user_repository.revoke_refresh_token(db, raw_token=payload.refresh_token)
    db.commit()
