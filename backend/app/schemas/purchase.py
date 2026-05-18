from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class PurchaseCreditsRequest(BaseModel):
    amount: float = Field(gt=0)
    blockchain_tx_hash: str | None = Field(default=None, max_length=255)


class PurchaseResponse(BaseModel):
    message: str
    purchase_id: UUID
    order_id: UUID
    transaction_id: UUID
    project_id: UUID
    buyer_wallet: str | None = None
    credits_purchased: float
    remaining_credits: float
    price_per_credit: float
    total_price: float
    currency: str
    status: str


class PurchaseHistoryResponse(BaseModel):
    purchase_id: UUID
    order_id: UUID | None = None
    transaction_id: UUID | None = None
    project_id: UUID
    project_name: str
    credits_purchased: float
    price_per_credit: float
    total_price: float
    currency: str
    blockchain_tx_hash: str | None = None
    status: str
    created_at: datetime
