from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class KYCVerification(Base):
    __tablename__ = "kyc_verifications"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Document types: govt_id | selfie | org_registration | address_proof
    document_type = Column(String, nullable=False)

    file_url = Column(String, nullable=False)

    # Status: pending | approved | rejected
    status = Column(String, default="pending", nullable=False, index=True)

    reviewed_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    rejection_reason = Column(Text, nullable=True)

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
