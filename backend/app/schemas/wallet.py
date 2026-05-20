from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

class WalletResponse(BaseModel):
    id: UUID
    user_id: UUID
    wallet_address: str | None
    is_verified: bool
    fiat_balance: float
    carbon_balance: float
    total_purchased: float
    total_retired: float
    currency: str
    last_blockchain_sync: datetime | None
    updated_at: datetime

class WalletVerificationRequest(BaseModel):
    wallet_address: str
    signature: str | None = None

class WalletBalanceResponse(BaseModel):
    carbon_balance: float
    fiat_balance: float
    currency: str

class CreditOwnershipResponse(BaseModel):
    id: UUID
    project_id: UUID
    project_name: str
    total_credits_owned: float
    credits_retired: float
    updated_at: datetime

class WalletTransactionResponse(BaseModel):
    id: UUID
    transaction_type: str
    amount: float
    credits: float
    currency: str
    status: str
    blockchain_tx_hash: str | None
    created_at: datetime
