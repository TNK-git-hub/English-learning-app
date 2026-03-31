from fastapi import APIRouter, Depends
from config.database import get_db

router = APIRouter(prefix="/api/articles", tags=["Articles"])


@router.get("/")
def get_all_articles(conn=Depends(get_db)):
    """Lấy danh sách tất cả bài viết kèm tags từ database."""
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT a.id, a.title, a.content, a.image_url, a.created_at,
                   GROUP_CONCAT(t.name) AS tags
            FROM articles a
            LEFT JOIN article_tags at2 ON a.id = at2.article_id
            LEFT JOIN tags t ON at2.tag_id = t.id
            GROUP BY a.id
            ORDER BY a.created_at DESC
        """)
        articles = cursor.fetchall()

        # Chuyển chuỗi tags thành mảng
        for article in articles:
            article["tags"] = article["tags"].split(",") if article["tags"] else []
            # Convert datetime to string for JSON serialization
            if article["created_at"]:
                article["created_at"] = article["created_at"].isoformat()

        return {"success": True, "data": articles, "total": len(articles)}
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
