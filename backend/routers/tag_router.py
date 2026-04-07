"""Tag endpoints."""
from fastapi import APIRouter, Depends
from services.tag_service import TagService
from config.database import get_db

router = APIRouter(prefix="/api/tags", tags=["Tags"])


@router.get("/")
def get_all_tags(conn=Depends(get_db)):
    """Get all tags with article counts."""
    return TagService.get_all_tags(conn)
