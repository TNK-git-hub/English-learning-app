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


def delete(conn, user_id: int) -> bool:
    """Xóa user theo ID. Trả về True nếu xóa được."""
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        cursor.close()


def update_role(conn, user_id: int, role: str) -> bool:
    """Cập nhật role của user. Trả về True nếu thành công."""
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET role = %s WHERE id = %s", (role, user_id))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        cursor.close()
