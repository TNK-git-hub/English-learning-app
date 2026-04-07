"""Global exception handlers for consistent error responses."""
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


def register_error_handlers(app: FastAPI):
    """Register global error handlers with the FastAPI app."""

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        """Handle Pydantic validation errors with clear field-level messages."""
        errors = []
        for error in exc.errors():
            field = " → ".join(str(loc) for loc in error["loc"] if loc != "body")
            errors.append(f"{field}: {error['msg']}")

        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": "Validation error",
                "errors": errors
            }
        )

    @app.exception_handler(HTTPException)
    async def http_error_handler(request: Request, exc: HTTPException):
        """Handle HTTP exceptions with consistent format."""
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.detail
            }
        )

    @app.exception_handler(Exception)
    async def general_error_handler(request: Request, exc: Exception):
        """Catch-all handler for unexpected errors."""
        print(f"❌ Unexpected error: {exc}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal server error"
            }
        )
