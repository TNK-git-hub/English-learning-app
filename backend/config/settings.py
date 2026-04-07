"""
Centralized configuration — single source of truth.
All settings are read from environment variables with sensible defaults.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from .env file."""

    # Database
    DB_HOST: str = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT: int = int(os.getenv("DB_PORT", 3306))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "123456")
    DB_NAME: str = os.getenv("DB_NAME", "LearnUp")

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "learnup_secret_key_2026")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = int(os.getenv("JWT_EXPIRY_HOURS", 24))

    # Email
    EMAIL_USER: str = os.getenv("EMAIL_USER", "")
    EMAIL_PASS: str = os.getenv("EMAIL_PASS", "")

    # Server
    PORT: int = int(os.getenv("PORT", 8001))

    @property
    def db_config(self) -> dict:
        """Return database connection parameters as a dict."""
        return {
            "host": self.DB_HOST,
            "port": self.DB_PORT,
            "user": self.DB_USER,
            "password": self.DB_PASSWORD,
            "database": self.DB_NAME,
            "charset": "utf8mb4",
        }


settings = Settings()
