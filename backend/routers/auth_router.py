"""Authentication endpoints — Login & Register (US1)."""
from fastapi import APIRouter, Depends
from schemas.auth_schema import LoginRequest, RegisterRequest
from services.auth_service import AuthService
from config.database import get_db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login")
def login(request: LoginRequest, conn=Depends(get_db)):
    """
    Authenticate user and return JWT token.
    - Validates email format and password
    - Returns token + user info on success
    - Returns 401 on invalid credentials
    """
    return AuthService.login(conn, request.email, request.password)


@router.post("/register")
def register(request: RegisterRequest, conn=Depends(get_db)):
    """
    Register a new user account.
    - Validates email format, password length (>=8), name length (>=2)
    - Hashes password with bcrypt
    - Returns token + user info for auto-login after registration
    - Returns 409 if email already exists
    """
    return AuthService.register(conn, request.email, request.password, request.name)
