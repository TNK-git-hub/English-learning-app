"""
Users Router — API endpoints cho User (login, register, profile).
Thin layer — chỉ nhận request, gọi service, trả response.
"""
from fastapi import APIRouter, Depends
from config.database import get_db
from schemas.user_schema import LoginRequest, RegisterRequest
from services import user_service
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post("/login")
def login(request: LoginRequest, conn=Depends(get_db)):
    """Đăng nhập — trả về JWT token."""
    return user_service.login(request.email, request.password, conn)


@router.post("/register")
def register(request: RegisterRequest, conn=Depends(get_db)):
    """Đăng ký tài khoản mới."""
    return user_service.register(request.email, request.password, request.name, conn)


@router.get("/profile")
def get_profile(current_user=Depends(get_current_user), conn=Depends(get_db)):
    """Lấy thông tin user hiện tại (protected)."""
    return user_service.get_profile(current_user["sub"], conn)
