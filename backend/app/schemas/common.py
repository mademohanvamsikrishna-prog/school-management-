"""
Common shared Pydantic schemas used across multiple API modules.

These are the base response envelope types that all endpoints should use
to maintain a consistent API response structure.
"""
from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel

DataT = TypeVar("DataT")


class SuccessResponse(BaseModel, Generic[DataT]):
    """
    Standard success envelope for all API responses.

    Example:
        {
            "success": true,
            "data": { ... },
            "message": "Operation completed"
        }
    """
    success: bool = True
    data: Optional[DataT] = None
    message: Optional[str] = None


class PaginatedResponse(BaseModel, Generic[DataT]):
    """
    Paginated list response envelope.

    Example:
        {
            "success": true,
            "data": [ ... ],
            "total": 150,
            "page": 1,
            "page_size": 20,
            "total_pages": 8
        }
    """
    success: bool = True
    data: List[DataT]
    total: int
    page: int
    page_size: int
    total_pages: int


class ErrorDetail(BaseModel):
    """
    Standardized error detail object for validation and application errors.
    """
    field: Optional[str] = None
    message: str


class ErrorResponse(BaseModel):
    """
    Standard error envelope.

    Example:
        {
            "success": false,
            "error": "Validation failed",
            "details": [
                { "field": "email", "message": "Invalid email format" }
            ]
        }
    """
    success: bool = False
    error: str
    details: Optional[List[ErrorDetail]] = None
