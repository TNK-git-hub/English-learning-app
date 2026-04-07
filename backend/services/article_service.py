"""Business logic for articles — list, detail, CRUD, search."""
from fastapi import HTTPException, status
from repositories.article_repository import ArticleRepository
from typing import Optional


class ArticleService:
    """Article business logic."""

    @staticmethod
    def get_all_articles(conn, page: int = 1, limit: int = 10,
                         search: Optional[str] = None, tag: Optional[str] = None) -> dict:
        """Get paginated articles with optional search/filter."""
        articles, total = ArticleRepository.find_all(
            conn, page=page, limit=limit, search=search, tag=tag
        )

        # Transform raw data
        for article in articles:
            article["tags"] = article["tags"].split(",") if article["tags"] else []
            if article["created_at"]:
                article["created_at"] = article["created_at"].isoformat()

        return {
            "success": True,
            "data": articles,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": max(1, (total + limit - 1) // limit)
        }

    @staticmethod
    def get_article_by_id(conn, article_id: str) -> dict:
        """Get a single article by ID. Raises 404 if not found."""
        article = ArticleRepository.find_by_id(conn, article_id)

        if not article:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Article with id '{article_id}' not found."
            )

        article["tags"] = article["tags"].split(",") if article["tags"] else []
        if article["created_at"]:
            article["created_at"] = article["created_at"].isoformat()

        return {"success": True, "data": article}

    @staticmethod
    def create_article(conn, title: str, content: str,
                       image_url: str = None, tag_ids: list = None) -> dict:
        """Create a new article."""
        article_id = ArticleRepository.create(conn, title, content, image_url, tag_ids or [])
        return {
            "success": True,
            "message": "Article created successfully",
            "data": {"id": article_id}
        }

    @staticmethod
    def update_article(conn, article_id: str, title=None, content=None,
                       image_url=None, tag_ids=None) -> dict:
        """Update an existing article. Raises 404 if not found."""
        existing = ArticleRepository.find_by_id(conn, article_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Article with id '{article_id}' not found."
            )

        ArticleRepository.update(conn, article_id, title, content, image_url, tag_ids)
        return {"success": True, "message": "Article updated successfully"}

    @staticmethod
    def delete_article(conn, article_id: str) -> dict:
        """Delete an article. Raises 404 if not found."""
        deleted = ArticleRepository.delete(conn, article_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Article with id '{article_id}' not found."
            )
        return {"success": True, "message": "Article deleted successfully"}

    @staticmethod
    def search_articles(conn, keyword: str, page: int = 1, limit: int = 10) -> dict:
        """Search articles by keyword in title and content."""
        return ArticleService.get_all_articles(conn, page=page, limit=limit, search=keyword)
