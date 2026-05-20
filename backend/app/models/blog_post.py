from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.db.session import Base

from sqlalchemy.dialects.postgresql import UUID

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    content = Column(Text, nullable=False)
    thumbnail = Column(String(512), nullable=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(String(50), default="draft") # draft, published
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    author = relationship("User")
