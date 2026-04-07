"""Standardized API response helpers."""
from typing import Any, Optional


def success_response(
    data: Any = None,
    message: str = "Success",
    total: Optional[int] = None,
    **kwargs
) -> dict:
    """Create a standardized success response."""
    response = {"success": True, "message": message}
    if data is not None:
        response["data"] = data
    if total is not None:
        response["total"] = total
    response.update(kwargs)
    return response


def error_response(message: str = "An error occurred") -> dict:
    """Create a standardized error response."""
    return {"success": False, "message": message}
