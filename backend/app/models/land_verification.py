from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class LandVerification(Base):
    __tablename__ = "land_verifications"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Document types: land_deed | lease_certificate | forest_rights
    document_type = Column(String, nullable=False, default="land_deed")

    document_url = Column(String, nullable=False)

    # Status: pending | approved | rejected
    verification_status = Column(String, default="pending", nullable=False, index=True)

    verified_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    verified_at = Column(DateTime(timezone=True), nullable=True)

    rejection_reason = Column(Text, nullable=True)

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
