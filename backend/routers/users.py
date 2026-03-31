from fastapi import APIRouter
from models.schemas import LoginRequest

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post("/login")
def login(request: LoginRequest):
    """
    Login endpoint — hiện tại luôn trả về success (chưa validate).
    """
    return {
        "status": "Success",
        "message": "Đăng nhập thành công",
        "token": "mock_token_for_development",
        "user": {
            "userId": 1,
            "email": request.email,
            "name": "User",
            "role": "user"
        }
    }
