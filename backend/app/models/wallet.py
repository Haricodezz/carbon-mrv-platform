from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.session import Base

class Wallet(Base):
    __tablename__ = "wallets"

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
        unique=True,
        index=True
    )

    # Core Financials
    fiat_balance = Column(Float, default=0.0)
    escrow_balance = Column(Float, default=0.0)

    # Carbon Credit Balances (Aggregated)
    carbon_balance = Column(Float, default=0.0, comment="Current spendable/owned credits")
    total_purchased = Column(Float, default=0.0)
    total_retired = Column(Float, default=0.0)

    # Blockchain Sync
    wallet_address = Column(String, nullable=True, index=True)
    is_verified = Column(Boolean, default=False)
    last_blockchain_sync = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    currency = Column(String, default="INR", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", backref="wallet", uselist=False)
