from fastapi import APIRouter, Body, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.purchase import (
    PurchaseCreditsRequest,
    PurchaseHistoryResponse,
    PurchaseResponse,
)
from app.services.marketplace_service import (
    list_user_purchases,
    purchase_project_credits,
)


router = APIRouter(
    prefix="/api/purchases",
    tags=["Purchases"]
)


@router.post("/{project_id}", response_model=PurchaseResponse)
def purchase_carbon_credits(
    project_id: str,
    amount: float | None = None,
    payload: PurchaseCreditsRequest | None = Body(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    purchase_amount = payload.amount if payload else amount
    blockchain_tx_hash = payload.blockchain_tx_hash if payload else None

    if purchase_amount is None:
        purchase_amount = 1

    purchase, order, transaction, project = purchase_project_credits(
        db=db,
        project_id=project_id,
        buyer=current_user,
        amount=purchase_amount,
        blockchain_tx_hash=blockchain_tx_hash,
    )

    return {
        "message": "Carbon credits purchased successfully.",
        "purchase_id": purchase.id,
        "order_id": order.id,
        "transaction_id": transaction.id,
        "project_id": project.id,
        "buyer_wallet": current_user.wallet_address,
        "credits_purchased": purchase.credits_purchased,
        "remaining_credits": project.credits_available,
        "price_per_credit": purchase.price_per_credit,
        "total_price": purchase.total_price,
        "currency": purchase.currency,
        "status": purchase.status,
    }


@router.get("/history", response_model=list[PurchaseHistoryResponse])
def get_purchase_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [
        {
            "purchase_id": purchase.id,
            "order_id": purchase.order_id,
            "transaction_id": purchase.transaction_id,
            "project_id": purchase.project_id,
            "project_name": project.project_name,
            "credits_purchased": purchase.credits_purchased,
            "price_per_credit": purchase.price_per_credit,
            "total_price": purchase.total_price,
            "currency": purchase.currency,
            "blockchain_tx_hash": purchase.blockchain_tx_hash,
            "status": purchase.status,
            "created_at": purchase.created_at,
        }
        for purchase, project in list_user_purchases(db, current_user)
    ]
