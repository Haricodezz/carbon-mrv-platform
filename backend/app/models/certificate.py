from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    certificate_id = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    buyer_id = Column(
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

    retired_credits = Column(
        Float,
        nullable=False
    )

    retirement_reason = Column(
        String,
        nullable=True
    )

    verification_status = Column(
        String,
        default="verified"
    )

    pdf_url = Column(
        String,
        nullable=True
    )

    issued_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )