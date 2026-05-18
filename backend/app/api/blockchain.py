from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user

from app.services.blockchain_service import (
    mint_credits,
    retire_credits,
    transfer_credits,
    get_wallet_balance,
    get_total_supply,
)


router = APIRouter(
    prefix="/api/blockchain",
    tags=["Blockchain"]
)


class MintCreditsRequest(BaseModel):
    recipient_wallet: str
    amount: int
    project_id: str


class RetireCreditsRequest(BaseModel):
    amount: int
    reason: str


class TransferCreditsRequest(BaseModel):
    recipient_wallet: str
    amount: int


@router.post("/mint")
def mint_carbon_credits(
    request: MintCreditsRequest,
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "auditor"]:
        raise HTTPException(
            status_code=403,
            detail="Only admin or auditor can mint credits."
        )

    if not current_user.wallet_verified:
        raise HTTPException(
            status_code=400,
            detail="Your wallet must be verified."
        )

    return mint_credits(
        request.recipient_wallet,
        request.amount,
        request.project_id
    )


@router.post("/retire")
def retire_carbon_credits(
    request: RetireCreditsRequest,
    current_user: User = Depends(get_current_user),
):
    if not current_user.wallet_verified:
        raise HTTPException(
            status_code=400,
            detail="Wallet verification required."
        )

    return retire_credits(
        request.amount,
        request.reason
    )


@router.post("/transfer")
def transfer_carbon_credits(
    request: TransferCreditsRequest,
    current_user: User = Depends(get_current_user),
):
    if not current_user.wallet_verified:
        raise HTTPException(
            status_code=400,
            detail="Wallet verification required."
        )

    return transfer_credits(
        request.recipient_wallet,
        request.amount
    )


@router.get("/balance")
def get_my_carbon_balance(
    current_user: User = Depends(get_current_user),
):
    if not current_user.wallet_address:
        raise HTTPException(
            status_code=400,
            detail="No wallet connected."
        )

    return get_wallet_balance(
        current_user.wallet_address
    )


@router.get("/supply")
def get_carbon_supply():
    return get_total_supply()