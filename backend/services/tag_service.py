"""Business logic for tags."""
from repositories.tag_repository import TagRepository


class TagService:
    """Tag business logic."""

    @staticmethod
    def get_all_tags(conn) -> dict:
        """Get all tags with their article counts."""
        tags = TagRepository.find_all_with_count(conn)
        return {"success": True, "data": tags, "total": len(tags)}
