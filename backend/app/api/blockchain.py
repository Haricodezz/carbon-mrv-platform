from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.services.wallet_service import wallet_service

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
    project_id: UUID
    amount: float
    reason: str


class TransferCreditsRequest(BaseModel):
    recipient_wallet: str
    amount: int


@router.post("/mint")
def mint_carbon_credits(
    request: MintCreditsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "auditor"]:
        raise HTTPException(
            status_code=403,
            detail="Only admin or auditor can mint credits."
        )

    receipt = mint_credits(
        request.recipient_wallet,
        request.amount,
        request.project_id
    )

    # Sync with local wallet if user exists with this wallet
    user = db.query(User).filter(User.wallet_address == request.recipient_wallet).first()
    if user:
        wallet_service.update_balances_from_purchase(db, user.id, float(request.amount))

    return receipt


@router.post("/retire")
def retire_carbon_credits(
    request: RetireCreditsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.wallet_address:
        raise HTTPException(
            status_code=400,
            detail="User must have a connected wallet to retire credits."
        )

    # Blockchain operation
    from app.services.blockchain_service import admin_retire_credits
    receipt = admin_retire_credits(
        current_user.wallet_address,
        int(request.amount),
        request.reason
    )

    # Sync internal ledger
    wallet_service.retire_credits(
        db, 
        current_user.id, 
        request.project_id, 
        request.amount, 
        receipt.get("tx_hash")
    )

    return receipt


@router.post("/transfer")
def transfer_carbon_credits(
    request: TransferCreditsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    receipt = transfer_credits(
        request.recipient_wallet,
        request.amount
    )

    # Internal Sync: Deduct from sender
    wallet = wallet_service.get_or_create_wallet(db, current_user.id)
    wallet.carbon_balance -= float(request.amount)
    
    # Add to receiver if they exist
    receiver = db.query(User).filter(User.wallet_address == request.recipient_wallet).first()
    if receiver:
        receiver_wallet = wallet_service.get_or_create_wallet(db, receiver.id)
        receiver_wallet.carbon_balance += float(request.amount)

    db.commit()
    return receipt


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
