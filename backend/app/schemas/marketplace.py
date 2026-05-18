from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class MarketplaceProjectResponse(BaseModel):
    id: UUID
    project_name: str
    project_type: str | None = None
    country: str
    location: str
    description: str | None = None
    estimated_credits: float
    available_credits: float
    credits_sold: float
    price_per_credit: float
    currency: str
    tokenized: bool
    audit_status: str
    status: str
    owner_id: UUID


class CreditPricingUpdate(BaseModel):
    price_per_credit: float = Field(gt=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)


class CreditInventoryUpdate(BaseModel):
    credits_available: float = Field(ge=0)


class MarketplaceSummary(BaseModel):
    total_projects: int
    total_available_credits: float
    total_credits_sold: float
    average_price_per_credit: float
    currency: str


class MarketplaceOrderResponse(BaseModel):
    order_id: UUID
    purchase_id: UUID | None = None
    transaction_id: UUID | None = None
    project_id: UUID
    project_name: str
    buyer_id: UUID
    seller_id: UUID
    credits_ordered: float
    price_per_credit: float
    subtotal: float
    platform_fee: float
    total_amount: float
    currency: str
    status: str
    created_at: datetime


class TransactionResponse(BaseModel):
    transaction_id: UUID
    order_id: UUID
    buyer_id: UUID
    project_id: UUID
    transaction_type: str
    amount: float
    credits: float
    currency: str
    blockchain_tx_hash: str | None = None
    status: str
    created_at: datetime
