from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID

from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.purchase import Purchase
from app.models.transaction import Transaction
from app.models.order import Order
from app.models.payment import Payment
from app.models.credit_ownership import CreditOwnership
from app.models.wallet import Wallet
from app.core.dependencies import get_current_user
from app.schemas.purchase import (
    CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest, PurchaseResponse, PurchaseHistoryResponse
)
from app.services.payment_service import payment_service
from app.core.config import settings

router = APIRouter(prefix="/api/purchases", tags=["Purchases"])

COMPANY_ROLE = "company"
MARKETPLACE_STATUSES = ("marketplace", "active")


@router.post("/initiate", response_model=CreateOrderResponse, include_in_schema=False)
def initiate_purchase_order(
    payload: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Legacy alias used by older frontend builds."""
    return create_purchase_order(payload, db, current_user)


@router.post("/verify", response_model=PurchaseResponse, include_in_schema=False)
def verify_purchase_legacy(
    payload: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Legacy alias used by older frontend builds."""
    return verify_purchase_payment(payload, db, current_user)


@router.post("/create-order", response_model=CreateOrderResponse)
def create_purchase_order(
    payload: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != COMPANY_ROLE:
        raise HTTPException(status_code=403, detail="Only companies can buy carbon credits.")

    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project or project.status not in MARKETPLACE_STATUSES:
        raise HTTPException(status_code=404, detail="Project not available in marketplace.")

    if project.credits_available < payload.amount:
        raise HTTPException(status_code=400, detail="Insufficient credits available.")

    total_price = payload.amount * project.price_per_credit
    receipt = f"rec_{current_user.id}_{func.now()}"

    razorpay_order = payment_service.create_razorpay_order(
        amount_inr=total_price,
        currency=project.credit_currency or "INR",
        receipt=receipt
    )

    payment = Payment(
        user_id=current_user.id,
        payment_type="purchase",
        payment_method="razorpay",
        provider_order_id=razorpay_order["id"],
        currency=project.credit_currency or "INR",
        amount=total_price,
        status="pending"
    )
    db.add(payment)
    db.commit()

    return {
        "order_id": razorpay_order["id"],
        "amount_inr": total_price,
        "currency": project.credit_currency or "INR",
        "project_id": project.id,
        "key_id": settings.RAZORPAY_KEY_ID
    }

@router.post("/verify-payment", response_model=PurchaseResponse)
def verify_purchase_payment(
    payload: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not payment_service.verify_payment_signature(
        payload.razorpay_order_id, payload.razorpay_payment_id, payload.razorpay_signature
    ):
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    payment = db.query(Payment).filter(Payment.provider_order_id == payload.razorpay_order_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    payment.provider_payment_id = payload.razorpay_payment_id
    payment.status = "completed"
    payment.verification_status = "verified"

    try:
        project = db.query(Project).filter(Project.id == payload.project_id).with_for_update().first()
        if project.credits_available < payload.amount:
            raise HTTPException(status_code=400, detail="Insufficient credits available.")

        # Create Platform Order (Legacy context)
        order = Order(
            buyer_id=current_user.id, seller_id=project.owner_id, project_id=project.id,
            credits_ordered=payload.amount, price_per_credit=project.price_per_credit,
            subtotal=payment.amount, total_amount=payment.amount,
            currency=payment.currency, status="completed"
        )
        db.add(order)
        db.flush()

        # Create Ledger Transaction
        transaction = Transaction(
            order_id=order.id, buyer_id=current_user.id, project_id=project.id,
            transaction_type="credit_purchase", amount=payment.amount,
            credits=payload.amount, currency=payment.currency, status="completed"
        )
        db.add(transaction)
        db.flush()

        # On-Chain Transfer
        blockchain_tx_hash = None
        buyer_wallet = current_user.wallet_address
        seller = db.query(User).filter(User.id == project.owner_id).first()
        seller_wallet = seller.wallet_address if seller else None

        if settings.ENABLE_BLOCKCHAIN and buyer_wallet and seller_wallet:
            try:
                from app.services.blockchain_service import admin_transfer_credits
                receipt = admin_transfer_credits(seller_wallet, buyer_wallet, int(payload.amount))
                blockchain_tx_hash = receipt.get("tx_hash")
            except Exception as e:
                # Log and continue (graceful degradation)
                print(f"[BLOCKCHAIN] Transfer failed: {str(e)}")

        # Create Final Purchase Record
        purchase = Purchase(
            buyer_id=current_user.id, project_id=project.id, order_id=order.id,
            transaction_id=transaction.id, credits_purchased=payload.amount,
            price_per_credit=project.price_per_credit, total_price=payment.amount,
            currency=payment.currency, razorpay_order_id=payload.razorpay_order_id,
            razorpay_payment_id=payload.razorpay_payment_id, payment_status="completed",
            blockchain_tx_hash=blockchain_tx_hash,
            status="completed"
        )
        db.add(purchase)

        # Inventory deduction
        project.credits_available -= payload.amount
        project.credits_sold = float(project.credits_sold or 0) + payload.amount
        if project.credits_available <= 0:
            project.status = "active"

        # Update Credit Ownership for Buyer
        ownership = db.query(CreditOwnership).filter_by(owner_id=current_user.id, project_id=payload.project_id).first()
        if ownership:
            ownership.total_credits_owned += payload.amount
        else:
            db.add(CreditOwnership(owner_id=current_user.id, project_id=payload.project_id, total_credits_owned=payload.amount))

        # Deduct Credit Ownership from Seller/Farmer
        seller_ownership = db.query(CreditOwnership).filter_by(owner_id=project.owner_id, project_id=payload.project_id).first()
        if seller_ownership:
            seller_ownership.total_credits_owned = max(0.0, seller_ownership.total_credits_owned - payload.amount)

        # Update Buyer Wallet
        wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
        if not wallet:
            wallet = Wallet(user_id=current_user.id)
            db.add(wallet)
        wallet.carbon_balance = float(wallet.carbon_balance or 0) + float(payload.amount)
        wallet.total_purchased = float(wallet.total_purchased or 0) + float(payload.amount)

        # Update Seller Wallet
        if seller:
            seller_wallet_model = db.query(Wallet).filter(Wallet.user_id == seller.id).first()
            if seller_wallet_model:
                seller_wallet_model.carbon_balance = max(0.0, float(seller_wallet_model.carbon_balance or 0) - float(payload.amount))

        db.commit()
        db.refresh(purchase)

        return {
            "message": "Payment verified and credits purchased successfully.",
            "purchase_id": purchase.id,
            "transaction_id": transaction.id,
            "project_id": project.id,
            "credits_purchased": purchase.credits_purchased,
            "total_price": purchase.total_price,
            "currency": purchase.currency,
            "status": purchase.status
        }
    except Exception as e:
        db.rollback()
        payment.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Purchase failed: {str(e)}")

@router.get("/history", response_model=list[PurchaseHistoryResponse])
def get_purchase_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Purchase, Project).join(Project, Purchase.project_id == Project.id).filter(Purchase.buyer_id == current_user.id).order_by(Purchase.created_at.desc())
    results = query.all()
    
    return [
        {
            "purchase_id": purchase.id,
            "project_id": project.id,
            "project_name": project.project_name,
            "credits_purchased": purchase.credits_purchased,
            "price_per_credit": purchase.price_per_credit,
            "total_price": purchase.total_price,
            "currency": purchase.currency,
            "razorpay_payment_id": purchase.razorpay_payment_id,
            "blockchain_tx_hash": purchase.blockchain_tx_hash,
            "status": purchase.status,
            "created_at": purchase.created_at
        }
        for purchase, project in results
    ]
