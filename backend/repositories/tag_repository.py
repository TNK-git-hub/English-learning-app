"""Data access layer for tags table — only SQL queries, no business logic."""


class TagRepository:
    """SQL queries for the tags table."""

    @staticmethod
    def find_all_with_count(conn):
        """Get all tags with their article counts."""
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT t.id, t.name, COUNT(at2.article_id) AS article_count
                FROM tags t
                LEFT JOIN article_tags at2 ON t.id = at2.tag_id
                GROUP BY t.id
                ORDER BY article_count DESC, t.name ASC
            """)
            return cursor.fetchall()
        finally:
            cursor.close()

    @staticmethod
    def find_by_id(conn, tag_id: int):
        """Find a tag by ID."""
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM tags WHERE id = %s", (tag_id,))
            return cursor.fetchone()
        finally:
            cursor.close()
