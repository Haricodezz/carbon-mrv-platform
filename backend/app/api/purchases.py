from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.purchase import (
    PurchaseInitiateRequest,
    PurchaseInitiateResponse,
    PurchaseVerifyRequest,
    PurchaseResponse,
    PurchaseHistoryResponse,
    CreditOwnershipResponse
)
from app.services.purchase_service import (
    initiate_purchase,
    verify_and_complete_purchase,
    get_user_purchase_history,
    get_user_credit_ownership
)

router = APIRouter(
    prefix="/api/purchases",
    tags=["Purchases"]
)

@router.post("/initiate", response_model=PurchaseInitiateResponse)
def api_initiate_purchase(
    payload: PurchaseInitiateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Step 1: Initiate a purchase by creating a Razorpay order.
    """
    return initiate_purchase(
        db=db,
        user=current_user,
        project_id=payload.project_id,
        amount=payload.amount
    )

@router.post("/verify", response_model=PurchaseResponse)
def api_verify_purchase(
    payload: PurchaseVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Step 2: Verify Razorpay payment and finalize purchase.
    """
    purchase = verify_and_complete_purchase(
        db=db,
        user=current_user,
        project_id=payload.project_id,
        amount=payload.amount,
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        razorpay_signature=payload.razorpay_signature
    )

    return {
        "message": "Payment verified and credits purchased successfully.",
        "purchase_id": purchase.id,
        "transaction_id": purchase.transaction_id,
        "project_id": purchase.project_id,
        "credits_purchased": purchase.credits_purchased,
        "total_price": purchase.total_price,
        "currency": purchase.currency,
        "status": purchase.status
    }

@router.get("/history", response_model=list[PurchaseHistoryResponse])
def api_get_purchase_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the purchase history for the current company.
    """
    results = get_user_purchase_history(db, current_user.id)
    return [
        {
            "purchase_id": purchase.id,
            "project_id": project.id,
            "project_name": project.project_name,
            "credits_purchased": purchase.credits_purchased,
            "price_per_credit": purchase.price_per_credit,
            "total_price": purchase.total_price,
            "currency": purchase.currency,
            "blockchain_tx_hash": purchase.blockchain_tx_hash,
            "status": purchase.status,
            "created_at": purchase.created_at
        }
        for purchase, project in results
    ]

@router.get("/credits", response_model=list[CreditOwnershipResponse])
def api_get_credit_ownership(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the current credit ownership balance for the company.
    """
    results = get_user_credit_ownership(db, current_user.id)
    return [
        {
            "project_id": project.id,
            "project_name": project.project_name,
            "total_credits_owned": ownership.total_credits_owned,
            "updated_at": ownership.updated_at
        }
        for ownership, project in results
    ]
