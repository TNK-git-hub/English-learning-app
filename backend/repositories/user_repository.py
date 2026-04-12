"""
User Repository — Data access layer cho bảng users.
Chỉ chứa SQL queries, KHÔNG có business logic.
"""
from typing import Optional, Dict


def find_by_email(conn, email: str) -> Optional[Dict]:
    """Tìm user theo email."""
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        return cursor.fetchone()
    finally:
        cursor.close()


def find_by_id(conn, user_id: int) -> Optional[Dict]:
    """Tìm user theo ID."""
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, email, name, role, created_at FROM users WHERE id = %s",
            (user_id,)
        )
        return cursor.fetchone()
    finally:
        cursor.close()


def create(conn, email: str, password_hash: str, name: str, role: str = "user") -> int:
    """Tạo user mới, trả về ID."""
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (email, password_hash, name, role) VALUES (%s, %s, %s, %s)",
            (email, password_hash, name, role)
        )
        conn.commit()
        return cursor.lastrowid
    finally:
        cursor.close()


def find_all(conn) -> list:
    """Lấy danh sách tất cả users (admin)."""
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC")
        return cursor.fetchall()
    finally:
        cursor.close()
