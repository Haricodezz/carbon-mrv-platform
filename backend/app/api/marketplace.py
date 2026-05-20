from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user, require_role
from app.schemas.marketplace import (
    CreditInventoryUpdate,
    CreditPricingUpdate,
    MarketplaceOrderResponse,
    MarketplaceProjectResponse,
    MarketplaceSummary,
    TransactionResponse,
)
from app.services.marketplace_service import (
    available_credit_balance,
    get_marketplace_project,
    list_marketplace_projects,
    list_orders,
    list_transactions,
    marketplace_summary,
    update_project_inventory,
    update_project_pricing,
)


router = APIRouter(
    prefix="/api/marketplace",
    tags=["Marketplace"]
)


def _serialize_project(project) -> dict:
    available_credits = available_credit_balance(project)
    return {
        "id": project.id,
        "project_name": project.project_name,
        "project_type": project.project_type,
        "country": project.country,
        "location": project.location,
        "description": project.description,
        "estimated_credits": available_credits,
        "available_credits": available_credits,
        "credits_sold": float(project.credits_sold or 0),
        "price_per_credit": float(project.price_per_credit or 0),
        "currency": project.credit_currency or "INR",
        "tokenized": project.tokenized,
        "audit_status": project.audit_status,
        "status": project.status,
        "owner_id": project.owner_id,
        "co2e": float(project.co2e or 0.0),
        "total_biomass": float(project.total_biomass or 0.0),
        "ndvi_score": float(project.ndvi_score or 0.0),
        "confidence_score": round(max(0.0, min(100.0, 100.0 - (project.fraud_risk_score or 0.0))), 2),
        "verification_date": project.updated_at.strftime("%Y-%m-%d") if project.updated_at else None,
        "methodology": "IPCC Tier 1 Forestry & XGBoost Regression"
    }


@router.get("/", response_model=list[MarketplaceProjectResponse])
def get_marketplace_projects(
    db: Session = Depends(get_db),
):
    return [
        _serialize_project(project)
        for project in list_marketplace_projects(db)
    ]


@router.get("/summary", response_model=MarketplaceSummary)
def get_marketplace_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "company"])),
):
    return marketplace_summary(db)


@router.get("/orders", response_model=list[MarketplaceOrderResponse])
def get_marketplace_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [
        {
            "order_id": order.id,
            "purchase_id": None,
            "transaction_id": None,
            "project_id": order.project_id,
            "project_name": project.project_name,
            "buyer_id": order.buyer_id,
            "seller_id": order.seller_id,
            "credits_ordered": order.credits_ordered,
            "price_per_credit": order.price_per_credit,
            "subtotal": order.subtotal,
            "platform_fee": order.platform_fee,
            "total_amount": order.total_amount,
            "currency": order.currency,
            "status": order.status,
            "created_at": order.created_at,
        }
        for order, project in list_orders(db, current_user)
    ]


@router.get("/transactions", response_model=list[TransactionResponse])
def get_marketplace_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [
        {
            "transaction_id": transaction.id,
            "order_id": transaction.order_id,
            "buyer_id": transaction.buyer_id,
            "project_id": transaction.project_id,
            "transaction_type": transaction.transaction_type,
            "amount": transaction.amount,
            "credits": transaction.credits,
            "currency": transaction.currency,
            "blockchain_tx_hash": transaction.blockchain_tx_hash,
            "status": transaction.status,
            "created_at": transaction.created_at,
        }
        for transaction in list_transactions(db, current_user)
    ]


@router.get("/{project_id}", response_model=MarketplaceProjectResponse)
def get_marketplace_project_details(
    project_id: str,
    db: Session = Depends(get_db),
):
    return _serialize_project(
        get_marketplace_project(db, project_id)
    )


@router.patch(
    "/{project_id}/pricing",
    response_model=MarketplaceProjectResponse,
)
def update_credit_pricing(
    project_id: str,
    payload: CreditPricingUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(["admin"])),
):
    project = update_project_pricing(
        db=db,
        project_id=project_id,
        price_per_credit=payload.price_per_credit,
        currency=payload.currency,
    )
    return _serialize_project(project)


@router.patch(
    "/{project_id}/inventory",
    response_model=MarketplaceProjectResponse,
)
def update_credit_inventory(
    project_id: str,
    payload: CreditInventoryUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(["admin"])),
):
    project = update_project_inventory(
        db=db,
        project_id=project_id,
        credits_available=payload.credits_available,
    )
    return _serialize_project(project)
