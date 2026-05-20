from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

class CreateOrderRequest(BaseModel):
    project_id: UUID
    amount: float = Field(gt=0, description="Amount of credits to purchase")

class CreateOrderResponse(BaseModel):
    order_id: str  # Razorpay order ID
    amount_inr: float
    currency: str
    project_id: UUID
    key_id: str | None = None  # Razorpay Key ID for frontend SDK

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    project_id: UUID
    amount: float

class PurchaseResponse(BaseModel):
    message: str
    purchase_id: UUID
    transaction_id: UUID
    project_id: UUID
    credits_purchased: float
    total_price: float
    currency: str
    status: str

class PurchaseHistoryResponse(BaseModel):
    purchase_id: UUID
    project_id: UUID
    project_name: str
    credits_purchased: float
    price_per_credit: float
    total_price: float
    currency: str
    razorpay_payment_id: str | None = None
    blockchain_tx_hash: str | None = None
    status: str
    created_at: datetime

class CreditOwnershipResponse(BaseModel):
    project_id: UUID
    project_name: str
    total_credits_owned: float
    updated_at: datetime
