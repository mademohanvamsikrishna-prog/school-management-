"""
Pydantic schemas for authentication endpoints.

Rule: hashed_password is NEVER included in any response schema.
"""
from typing import List, Optional
from pydantic import BaseModel, EmailStr, field_validator


# ---------------------------------------------------------------------------
# Requests
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Password must not be empty.")
        return v


class RefreshRequest(BaseModel):
    refresh_token: str


# ---------------------------------------------------------------------------
# Responses
# ---------------------------------------------------------------------------

class RoleSchema(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class UserMeResponse(BaseModel):
    """
    Safe user representation — password hash is explicitly excluded.
    """
    id: str
    email: str
    name: str
    is_active: bool
    avatar_url: Optional[str] = None
    role: RoleSchema
    permissions: List[str]

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """
    Response returned after a successful login or token refresh.
    Contains both tokens and a minimal user profile.
    """
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int           # seconds until access token expiry
    user: UserMeResponse
