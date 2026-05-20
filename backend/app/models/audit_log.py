from sqlalchemy import Column, String, DateTime, ForeignKey, Float, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.session import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    actor_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="ID of the Admin or Auditor performing the action"
    )

    target_id = Column(
        UUID(as_uuid=True),
        nullable=True,
        index=True,
        comment="ID of the project or user being audited"
    )

    action_type = Column(
        String,
        nullable=False,
        index=True
    )
    # approve | reject | verify | fraud_flag | certificate_issue | payment_review | user_suspend | user_activate

    target_type = Column(
        String,
        nullable=False,
        index=True
    )
    # project | user | payment | certificate

    notes = Column(
        String,
        nullable=True
    )

    risk_score = Column(
        Float,
        default=0.0
    )

    metadata_json = Column(
        JSON,
        nullable=True
    )

    blockchain_reference = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Relationships
    actor = relationship("User", foreign_keys=[actor_id], backref="performed_audits")
