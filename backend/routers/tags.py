from fastapi import APIRouter, Depends
from config.database import get_db

router = APIRouter(prefix="/api/tags", tags=["Tags"])

@router.get("/")
def get_all_tags(conn=Depends(get_db)):
    """Lấy danh sách tất cả tags kèm số lượng bài viết."""
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT t.id, t.name, COUNT(at2.article_id) AS article_count
            FROM tags t
            LEFT JOIN article_tags at2 ON t.id = at2.tag_id
            GROUP BY t.id
            ORDER BY article_count DESC, t.name ASC
        """)
        tags = cursor.fetchall()
        return {"success": True, "data": tags, "total": len(tags)}
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
