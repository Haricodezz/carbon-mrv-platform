from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    order_id = Column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    buyer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    transaction_type = Column(
        String,
        nullable=False,
    )
    # credit_purchase | credit_refund | credit_retirement

    amount = Column(
        Float,
        nullable=False,
    )

    credits = Column(
        Float,
        nullable=False,
    )

    currency = Column(
        String,
        default="INR",
        nullable=False,
    )

    blockchain_tx_hash = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        default="completed",
        nullable=False,
    )

    transaction_metadata = Column(
        JSON,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
