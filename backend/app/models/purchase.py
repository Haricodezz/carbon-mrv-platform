from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.session import Base

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True, index=True)
    
    credits_purchased = Column(Float, nullable=False)
    price_per_credit = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False, comment="Total INR amount")
    currency = Column(String, default="INR", nullable=False)

    razorpay_order_id = Column(String, nullable=True, index=True)
    razorpay_payment_id = Column(String, nullable=True, index=True)
    payment_status = Column(String, default="pending", nullable=False)

    blockchain_tx_hash = Column(String, nullable=True)
    status = Column(String, default="completed", nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Proper SQLAlchemy relationships
    buyer = relationship("User", foreign_keys=[buyer_id], backref="purchases")
    project = relationship("Project", foreign_keys=[project_id], backref="purchases")
    order = relationship("Order", foreign_keys=[order_id], backref="purchases")
    transaction = relationship("Transaction", foreign_keys=[transaction_id], backref="purchases")
