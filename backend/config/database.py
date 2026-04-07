"""MySQL connection pool management."""
from mysql.connector import pooling, Error
from config.settings import settings

_pool = None


def _get_pool():
    """Lazy-create MySQL connection pool (singleton)."""
    global _pool
    if _pool is None:
        try:
            _pool = pooling.MySQLConnectionPool(
                pool_name="learnup_pool",
                pool_size=5,
                **settings.db_config
            )
            print("✅ MySQL connection pool created successfully!")
        except Error as e:
            print(f"❌ MySQL connection error: {e}")
            raise
    return _pool


def get_db():
    """FastAPI dependency — yields a connection, auto-closes after use."""
    conn = _get_pool().get_connection()
    try:
        yield conn
    finally:
        conn.close()
