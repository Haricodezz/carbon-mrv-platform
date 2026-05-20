from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.wallet import (
    WalletResponse, 
    WalletVerificationRequest, 
    WalletBalanceResponse,
    CreditOwnershipResponse,
    WalletTransactionResponse
)
from app.services.wallet_service import wallet_service
from app.models.transaction import Transaction

router = APIRouter(prefix="/api/wallet", tags=["Wallet"])

@router.get("/", response_model=WalletResponse)
def get_user_wallet(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wallet = wallet_service.get_or_create_wallet(db, current_user.id)
    return wallet

@router.post("/verify", response_model=WalletResponse)
def verify_wallet(
    payload: WalletVerificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return wallet_service.verify_wallet_address(db, current_user.id, payload.wallet_address)

@router.get("/balance", response_model=WalletBalanceResponse)
def get_wallet_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wallet = wallet_service.get_or_create_wallet(db, current_user.id)
    return {
        "carbon_balance": wallet.carbon_balance,
        "fiat_balance": wallet.fiat_balance,
        "currency": wallet.currency
    }

@router.get("/credits", response_model=list[CreditOwnershipResponse])
def get_user_credits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = wallet_service.get_user_portfolio(db, current_user.id)
    return [
        {
            "id": ownership.id,
            "project_id": project.id,
            "project_name": project.project_name,
            "total_credits_owned": ownership.total_credits_owned,
            "credits_retired": ownership.credits_retired,
            "updated_at": ownership.updated_at
        }
        for ownership, project in results
    ]

@router.get("/transactions", response_model=list[WalletTransactionResponse])
def get_wallet_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transactions = db.query(Transaction).filter(
        Transaction.buyer_id == current_user.id
    ).order_by(Transaction.created_at.desc()).all()
    
    return transactions
