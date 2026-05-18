from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    buyer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    seller_id = Column(
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

    credits_ordered = Column(
        Float,
        nullable=False,
    )

    price_per_credit = Column(
        Float,
        nullable=False,
    )

    subtotal = Column(
        Float,
        nullable=False,
    )

    platform_fee = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    total_amount = Column(
        Float,
        nullable=False,
    )

    currency = Column(
        String,
        default="INR",
        nullable=False,
    )

    status = Column(
        String,
        default="completed",
        nullable=False,
    )
    # pending | completed | cancelled | failed | refunded

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
