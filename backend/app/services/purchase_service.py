from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.project import Project
from app.models.purchase import Purchase
from app.models.transaction import Transaction
from app.models.user import User
from app.models.payment import Payment
from app.models.order import Order
from app.models.wallet import Wallet
from app.models.credit_ownership import CreditOwnership
from app.services.payment_service import payment_service
from app.core.config import settings

COMPANY_ROLE = "company"
MARKETPLACE_STATUSES = ("marketplace", "active")

def initiate_purchase(db: Session, user: User, project_id: UUID, amount: float):
    if user.role != COMPANY_ROLE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only company accounts can buy carbon credits."
        )

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.status not in MARKETPLACE_STATUSES:
        raise HTTPException(status_code=400, detail="Project not available in marketplace")

    if project.credits_available < amount:
        raise HTTPException(status_code=400, detail="Insufficient credits available")

    total_price = amount * project.price_per_credit
    
    # Create Razorpay Order
    receipt = f"purchase_{user.id}_{project_id}_{func.now()}"
    razorpay_order = payment_service.create_razorpay_order(
        amount=total_price,
        currency=project.credit_currency or "INR",
        receipt=receipt
    )

    # Record pending payment
    payment = Payment(
        user_id=user.id,
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
        "amount": total_price,
        "currency": project.credit_currency or "INR",
        "project_id": project_id,
        "key_id": settings.RAZORPAY_KEY_ID
    }

def verify_and_complete_purchase(
    db: Session, 
    user: User, 
    project_id: UUID, 
    amount: float, 
    razorpay_order_id: str, 
    razorpay_payment_id: str, 
    razorpay_signature: str
):
    # 1. Verify Signature
    is_valid = payment_service.verify_payment_signature(
        razorpay_order_id, razorpay_payment_id, razorpay_signature
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # 2. Update Payment record
    payment = db.query(Payment).filter(Payment.provider_order_id == razorpay_order_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    
    payment.provider_payment_id = razorpay_payment_id
    payment.status = "completed"
    payment.verification_status = "verified"

    # 3. Process Purchase (Atomic)
    try:
        project = db.query(Project).filter(Project.id == project_id).with_for_update().first()
        if project.credits_available < amount:
            raise HTTPException(status_code=400, detail="Insufficient credits available")

        # Create Order
        order = Order(
            buyer_id=user.id,
            seller_id=project.owner_id,
            project_id=project.id,
            credits_ordered=amount,
            price_per_credit=project.price_per_credit,
            subtotal=amount * project.price_per_credit,
            total_amount=amount * project.price_per_credit,
            currency=project.credit_currency or "INR",
            status="completed"
        )
        db.add(order)
        db.flush()

        # Create Transaction
        transaction = Transaction(
            order_id=order.id,
            buyer_id=user.id,
            project_id=project.id,
            transaction_type="credit_purchase",
            amount=payment.amount,
            credits=amount,
            currency=payment.currency,
            status="completed"
        )
        db.add(transaction)
        db.flush()

        # Create Purchase
        purchase = Purchase(
            buyer_id=user.id,
            project_id=project.id,
            order_id=order.id,
            transaction_id=transaction.id,
            credits_purchased=amount,
            price_per_credit=project.price_per_credit,
            total_price=payment.amount,
            currency=payment.currency,
            status="completed"
        )
        db.add(purchase)

        # Update Project Inventory
        project.credits_available -= amount
        project.credits_sold = (project.credits_sold or 0) + amount
        if project.credits_available <= 0:
            project.status = "active" # Sold out from marketplace

        # Update Credit Ownership
        ownership = db.query(CreditOwnership).filter(
            CreditOwnership.owner_id == user.id,
            CreditOwnership.project_id == project_id
        ).first()
        
        if ownership:
            ownership.total_credits_owned += amount
        else:
            ownership = CreditOwnership(
                owner_id=user.id,
                project_id=project_id,
                total_credits_owned=amount
            )
            db.add(ownership)

        # Update Wallet (Fiat Balance if applicable, but Razorpay is external)
        # We might want to record that the user spent money
        wallet = db.query(Wallet).filter(Wallet.user_id == user.id).first()
        if wallet:
            # For direct Razorpay, we don't necessarily deduct from fiat_balance 
            # unless it was a deposit first. But here we can record the "outflow"
            # or just leave it as it is an external payment.
            pass

        db.commit()
        db.refresh(purchase)
        return purchase

    except Exception as e:
        db.rollback()
        payment.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Purchase completion failed: {str(e)}")

def get_user_purchase_history(db: Session, user_id: UUID):
    return db.query(Purchase, Project).join(Project, Purchase.project_id == Project.id).filter(
        Purchase.buyer_id == user_id
    ).order_by(Purchase.created_at.desc()).all()

def get_user_credit_ownership(db: Session, user_id: UUID):
    return db.query(CreditOwnership, Project).join(Project, CreditOwnership.project_id == Project.id).filter(
        CreditOwnership.owner_id == user_id
    ).all()
