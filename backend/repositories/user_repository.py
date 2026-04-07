"""Data access layer for users table — only SQL queries, no business logic."""


class UserRepository:
    """SQL queries for the users table."""

    @staticmethod
    def find_by_email(conn, email: str):
        """Find a user by email address."""
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            return cursor.fetchone()
        finally:
            cursor.close()

    @staticmethod
    def find_by_id(conn, user_id: int):
        """Find a user by ID (excludes password_hash)."""
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT id, email, name, role, created_at FROM users WHERE id = %s",
                (user_id,)
            )
            return cursor.fetchone()
        finally:
            cursor.close()

    @staticmethod
    def create(conn, email: str, password_hash: str, name: str, role: str = "user") -> int:
        """Insert a new user and return the new user ID."""
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (email, password_hash, name, role) VALUES (%s, %s, %s, %s)",
                (email, password_hash, name, role)
            )
            conn.commit()
            return cursor.lastrowid
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()

    @staticmethod
    def email_exists(conn, email: str) -> bool:
        """Check if an email is already registered."""
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT COUNT(*) FROM users WHERE email = %s", (email,))
            count = cursor.fetchone()[0]
            return count > 0
        finally:
            cursor.close()
