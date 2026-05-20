from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.session import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=True, index=True)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    
    transaction_type = Column(String, nullable=False, comment="credit_purchase | credit_mint | credit_transfer | credit_retirement")
    amount = Column(Float, nullable=False, comment="Total INR amount")
    credits = Column(Float, nullable=False)
    currency = Column(String, default="INR", nullable=False)
    
    blockchain_tx_hash = Column(String, nullable=True)
    status = Column(String, default="completed", nullable=False)
    transaction_metadata = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Proper SQLAlchemy relationships
    buyer = relationship("User", foreign_keys=[buyer_id], backref="ledger_transactions")
    project = relationship("Project", foreign_keys=[project_id], backref="ledger_transactions")
    order = relationship("Order", foreign_keys=[order_id], backref="ledger_transactions")
