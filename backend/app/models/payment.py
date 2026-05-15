from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class Payment(Base):
    __tablename__ = "payments"

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

    payment_type = Column(
        String,
        nullable=False
    )
    # deposit | withdrawal | purchase | escrow

    payment_method = Column(
        String,
        nullable=False
    )
    # razorpay | crypto

    provider_order_id = Column(
        String,
        nullable=True
    )

    provider_payment_id = Column(
        String,
        nullable=True
    )

    tx_hash = Column(
        String,
        nullable=True
    )

    currency = Column(
        String,
        nullable=False,
        default="INR"
    )

    amount = Column(
        Float,
        nullable=False
    )

    status = Column(
        String,
        default="pending"
    )
    # pending | completed | failed | escrowed

    verification_status = Column(
        String,
        default="pending"
    )
    # pending | verified | rejected

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )