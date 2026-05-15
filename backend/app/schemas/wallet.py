from pydantic import BaseModel


# Initial wallet connection request
class WalletConnectRequest(BaseModel):
    wallet_address: str
    wallet_type: str


# Backend-generated nonce response
class WalletNonceResponse(BaseModel):
    nonce: str


# Production wallet verification request
class WalletVerifyRequest(BaseModel):
    wallet_address: str
    message: str
    signature: str
    wallet_type: str