"""
Vocabulary Schemas — Request/Response models cho Vocabulary.
"""
from pydantic import BaseModel
from typing import List, Optional


class VocabCreateRequest(BaseModel):
    word: str
    article_id: Optional[str] = None


class VocabResponse(BaseModel):
    id: str
    word: str
    article_id: Optional[str] = None
    created_at: Optional[str] = None


class VocabListResponse(BaseModel):
    success: bool = True
    data: List[VocabResponse]
    total: int
