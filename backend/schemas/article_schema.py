"""Article-related Pydantic schemas."""
from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime


class ArticleCreate(BaseModel):
    """Schema for creating a new article."""
    title: str
    content: str
    image_url: Optional[str] = None
    tag_ids: List[int] = []

    @field_validator("title")
    @classmethod
    def validate_title(cls, v):
        if not v or len(v.strip()) < 5:
            raise ValueError("Title must be at least 5 characters long")
        return v.strip()

    @field_validator("content")
    @classmethod
    def validate_content(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError("Content must be at least 10 characters long")
        return v.strip()


class ArticleUpdate(BaseModel):
    """Schema for updating an existing article."""
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    tag_ids: Optional[List[int]] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v):
        if v is not None and len(v.strip()) < 5:
            raise ValueError("Title must be at least 5 characters long")
        return v.strip() if v else v

    @field_validator("content")
    @classmethod
    def validate_content(cls, v):
        if v is not None and len(v.strip()) < 10:
            raise ValueError("Content must be at least 10 characters long")
        return v.strip() if v else v


class ArticleResponse(BaseModel):
    """Schema for article data in responses."""
    id: str
    title: str
    content: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Optional[str] = None
    tags: List[str] = []
