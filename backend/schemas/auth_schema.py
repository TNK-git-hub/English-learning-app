"""Authentication-related Pydantic schemas."""
from pydantic import BaseModel, EmailStr, field_validator


class LoginRequest(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str
    name: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return v.strip()


class UserResponse(BaseModel):
    """Schema for user data in responses."""
    userId: int
    email: str
    name: str
    role: str


class TokenResponse(BaseModel):
    """Schema for authentication response with JWT token."""
    success: bool
    message: str
    token: str
    user: UserResponse
