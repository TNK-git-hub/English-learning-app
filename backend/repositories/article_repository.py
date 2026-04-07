"""Data access layer for articles table — only SQL queries, no business logic."""
import uuid
from typing import Optional


class ArticleRepository:
    """SQL queries for the articles table."""

    @staticmethod
    def find_all(conn, page: int = 1, limit: int = 10,
                 search: Optional[str] = None, tag: Optional[str] = None):
        """
        Fetch paginated articles with optional search/filter.
        Returns (articles_list, total_count).
        """
        cursor = conn.cursor(dictionary=True)
        try:
            # Build dynamic WHERE clause
            where_clauses = []
            params = []

            if search:
                where_clauses.append("(a.title LIKE %s OR a.content LIKE %s)")
                params.extend([f"%{search}%", f"%{search}%"])

            if tag:
                where_clauses.append("t.name = %s")
                params.append(tag)

            where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

            # Count total matching articles
            count_sql = f"""
                SELECT COUNT(DISTINCT a.id) AS cnt
                FROM articles a
                LEFT JOIN article_tags at2 ON a.id = at2.article_id
                LEFT JOIN tags t ON at2.tag_id = t.id
                {where_sql}
            """
            cursor.execute(count_sql, params)
            total = cursor.fetchone()["cnt"]

            # Fetch paginated results
            offset = (page - 1) * limit
            query_sql = f"""
                SELECT a.id, a.title, a.content, a.image_url, a.created_at,
                       GROUP_CONCAT(t.name) AS tags
                FROM articles a
                LEFT JOIN article_tags at2 ON a.id = at2.article_id
                LEFT JOIN tags t ON at2.tag_id = t.id
                {where_sql}
                GROUP BY a.id
                ORDER BY a.created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query_sql, params + [limit, offset])
            articles = cursor.fetchall()

            return articles, total
        finally:
            cursor.close()

    @staticmethod
    def find_by_id(conn, article_id: str):
        """Find a single article by ID with its tags."""
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT a.id, a.title, a.content, a.image_url, a.created_at,
                       GROUP_CONCAT(t.name) AS tags
                FROM articles a
                LEFT JOIN article_tags at2 ON a.id = at2.article_id
                LEFT JOIN tags t ON at2.tag_id = t.id
                WHERE a.id = %s
                GROUP BY a.id
            """, (article_id,))
            return cursor.fetchone()
        finally:
            cursor.close()

    @staticmethod
    def create(conn, title: str, content: str,
               image_url: Optional[str] = None, tag_ids: list = None) -> str:
        """Insert a new article and associate tags. Returns the new article ID."""
        cursor = conn.cursor()
        try:
            article_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO articles (id, title, content, image_url) VALUES (%s, %s, %s, %s)",
                (article_id, title, content, image_url)
            )
            if tag_ids:
                for tag_id in tag_ids:
                    cursor.execute(
                        "INSERT INTO article_tags (article_id, tag_id) VALUES (%s, %s)",
                        (article_id, tag_id)
                    )
            conn.commit()
            return article_id
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()

    @staticmethod
    def update(conn, article_id: str, title=None, content=None,
               image_url=None, tag_ids=None) -> bool:
        """Update article fields and/or tags."""
        cursor = conn.cursor()
        try:
            updates = []
            params = []
            if title is not None:
                updates.append("title = %s")
                params.append(title)
            if content is not None:
                updates.append("content = %s")
                params.append(content)
            if image_url is not None:
                updates.append("image_url = %s")
                params.append(image_url)

            if updates:
                params.append(article_id)
                cursor.execute(
                    f"UPDATE articles SET {', '.join(updates)} WHERE id = %s",
                    params
                )

            if tag_ids is not None:
                cursor.execute("DELETE FROM article_tags WHERE article_id = %s", (article_id,))
                for tag_id in tag_ids:
                    cursor.execute(
                        "INSERT INTO article_tags (article_id, tag_id) VALUES (%s, %s)",
                        (article_id, tag_id)
                    )

            conn.commit()
            return True
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()

    @staticmethod
    def delete(conn, article_id: str) -> bool:
        """Delete an article by ID. Returns True if a row was deleted."""
        cursor = conn.cursor()
        try:
            cursor.execute("DELETE FROM articles WHERE id = %s", (article_id,))
            conn.commit()
            return cursor.rowcount > 0
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()
