from sqlalchemy import Column, Float, DateTime, ForeignKey, UniqueConstraint, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.session import Base

class CreditOwnership(Base):
    __tablename__ = "credit_ownerships"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    owner_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Ownership Tracking
    total_credits_owned = Column(Float, default=0.0, nullable=False)
    credits_retired = Column(Float, default=0.0, nullable=False)
    
    # Reference for verification
    last_purchase_id = Column(UUID(as_uuid=True), ForeignKey("purchases.id", ondelete="SET NULL"), nullable=True)
    blockchain_reference = Column(String, nullable=True, comment="Blockchain token ID or specific metadata")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User", foreign_keys=[owner_id], backref="portfolio")
    project = relationship("Project", foreign_keys=[project_id], backref="owners")

    __table_args__ = (
        UniqueConstraint("owner_id", "project_id", name="uix_owner_project_portfolio"),
    )
