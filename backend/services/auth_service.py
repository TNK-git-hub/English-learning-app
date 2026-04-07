"""Business logic for authentication — login, register."""
from fastapi import HTTPException, status
from repositories.user_repository import UserRepository
from utils.security import hash_password, verify_password, create_access_token


class AuthService:
    """Authentication business logic."""

    @staticmethod
    def login(conn, email: str, password: str) -> dict:
        """Authenticate user credentials and return JWT token."""
        user = UserRepository.find_by_email(conn, email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please try again."
            )

        if not verify_password(password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please try again."
            )

        token = create_access_token(user["id"], user["email"], user["role"])

        return {
            "success": True,
            "message": "Đăng nhập thành công",
            "token": token,
            "user": {
                "userId": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"]
            }
        }

    @staticmethod
    def register(conn, email: str, password: str, name: str) -> dict:
        """Register a new user account with hashed password."""
        # Check duplicate email
        if UserRepository.email_exists(conn, email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered. Please use a different email."
            )

        # Hash password and create user
        hashed = hash_password(password)
        user_id = UserRepository.create(conn, email, hashed, name)

        # Auto-login: generate token immediately after registration
        token = create_access_token(user_id, email, "user")

        return {
            "success": True,
            "message": "Đăng ký thành công",
            "token": token,
            "user": {
                "userId": user_id,
                "email": email,
                "name": name,
                "role": "user"
            }
        }
