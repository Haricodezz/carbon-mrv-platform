from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class BlogPostBase(BaseModel):
    title: str
    content: str
    thumbnail: Optional[str] = None
    status: Optional[str] = "draft"
    category: Optional[str] = None

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    thumbnail: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None

class BlogPostResponse(BlogPostBase):
    id: UUID
    slug: str
    author_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
