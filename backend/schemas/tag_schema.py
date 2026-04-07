"""Tag-related Pydantic schemas."""
from pydantic import BaseModel


class TagResponse(BaseModel):
    """Schema for tag data in responses."""
    id: int
    name: str
    article_count: int = 0
