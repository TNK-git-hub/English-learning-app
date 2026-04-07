"""Article CRUD & Search endpoints (US2, US3)."""
from fastapi import APIRouter, Depends, Query
from typing import Optional
from schemas.article_schema import ArticleCreate, ArticleUpdate
from services.article_service import ArticleService
from middleware.auth_middleware import require_admin
from config.database import get_db

router = APIRouter(prefix="/api/articles", tags=["Articles"])


# ===== Public Endpoints =====

@router.get("/")
def get_all_articles(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in title & content"),
    tag: Optional[str] = Query(None, description="Filter by tag name"),
    conn=Depends(get_db)
):
    """
    Get paginated list of articles (US2).
    Supports search by keyword and filter by tag (US3).
    """
    return ArticleService.get_all_articles(
        conn, page=page, limit=limit, search=search, tag=tag
    )


@router.get("/search")
def search_articles(
    q: str = Query(..., min_length=1, description="Search keyword"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    conn=Depends(get_db)
):
    """Search articles by keyword in title and content (US3)."""
    return ArticleService.search_articles(conn, keyword=q, page=page, limit=limit)


@router.get("/{article_id}")
def get_article(article_id: str, conn=Depends(get_db)):
    """Get article detail by ID. Returns 404 if not found (US2)."""
    return ArticleService.get_article_by_id(conn, article_id)


# ===== Admin-Only Endpoints =====

@router.post("/")
def create_article(
    article: ArticleCreate,
    conn=Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Create a new article (admin only) (US2)."""
    return ArticleService.create_article(
        conn, article.title, article.content, article.image_url, article.tag_ids
    )


@router.put("/{article_id}")
def update_article(
    article_id: str,
    article: ArticleUpdate,
    conn=Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Update an existing article (admin only) (US2)."""
    return ArticleService.update_article(
        conn, article_id, article.title, article.content,
        article.image_url, article.tag_ids
    )


@router.delete("/{article_id}")
def delete_article(
    article_id: str,
    conn=Depends(get_db),
    current_user: dict = Depends(require_admin)
):
    """Delete an article (admin only) (US2)."""
    return ArticleService.delete_article(conn, article_id)
