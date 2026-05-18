from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.order import Order
from app.models.project import Project
from app.models.purchase import Purchase
from app.models.transaction import Transaction
from app.models.user import User


COMPANY_ROLE = "company"
MARKETPLACE_STATUSES = ("marketplace", "active")


def _parse_uuid(value: str, label: str) -> UUID:
    try:
        return UUID(str(value))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {label}.",
        )


def available_credit_balance(project: Project) -> float:
    if project.credits_available and project.credits_available > 0:
        return float(project.credits_available)

    generated = float(project.total_credits_generated or 0)
    sold = float(project.credits_sold or 0)
    return max(generated - sold, 0.0)


def ensure_marketplace_inventory(project: Project) -> None:
    if not project.price_per_credit or project.price_per_credit <= 0:
        project.price_per_credit = float(settings.DEFAULT_CREDIT_PRICE_INR)

    if not project.credit_currency:
        project.credit_currency = "INR"

    if project.credits_available is None or project.credits_available <= 0:
        generated = float(project.total_credits_generated or project.estimated_credits or 0)
        sold = float(project.credits_sold or 0)
        project.credits_available = max(generated - sold, 0.0)


def list_marketplace_projects(db: Session) -> list[Project]:
    projects = (
        db.query(Project)
        .filter(
            Project.audit_status == "approved",
            Project.status.in_(MARKETPLACE_STATUSES),
        )
        .order_by(Project.created_at.desc())
        .all()
    )

    available_projects = []
    for project in projects:
        ensure_marketplace_inventory(project)
        if available_credit_balance(project) > 0:
            available_projects.append(project)

    return available_projects


def get_marketplace_project(db: Session, project_id: str) -> Project:
    project_uuid = _parse_uuid(project_id, "project ID")

    project = (
        db.query(Project)
        .filter(
            Project.id == project_uuid,
            Project.audit_status == "approved",
            Project.status.in_(MARKETPLACE_STATUSES),
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Marketplace project not found.",
        )

    ensure_marketplace_inventory(project)
    return project


def update_project_pricing(
    db: Session,
    project_id: str,
    price_per_credit: float,
    currency: str,
) -> Project:
    project = get_marketplace_project(db, project_id)
    project.price_per_credit = price_per_credit
    project.credit_currency = currency.upper()

    db.commit()
    db.refresh(project)
    return project


def update_project_inventory(
    db: Session,
    project_id: str,
    credits_available: float,
) -> Project:
    project = get_marketplace_project(db, project_id)
    project.credits_available = credits_available
    project.total_credits_generated = max(
        float(project.total_credits_generated or 0),
        credits_available + float(project.credits_sold or 0),
    )

    db.commit()
    db.refresh(project)
    return project


def purchase_project_credits(
    db: Session,
    project_id: str,
    buyer: User,
    amount: float,
    blockchain_tx_hash: str | None = None,
) -> tuple[Purchase, Order, Transaction, Project]:
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Purchase amount must be greater than zero.",
        )

    if buyer.role != COMPANY_ROLE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only company accounts can buy carbon credits.",
        )

    if not buyer.wallet_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wallet connection required.",
        )

    project_uuid = _parse_uuid(project_id, "project ID")

    try:
        project = (
            db.query(Project)
            .filter(
                Project.id == project_uuid,
                Project.audit_status == "approved",
                Project.status.in_(MARKETPLACE_STATUSES),
            )
            .with_for_update()
            .first()
        )

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Marketplace project not found.",
            )

        if project.owner_id == buyer.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot buy credits from your own project.",
            )

        ensure_marketplace_inventory(project)
        available_credits = available_credit_balance(project)

        if available_credits < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient available credits.",
            )

        price_per_credit = float(project.price_per_credit)
        subtotal = round(amount * price_per_credit, 2)
        platform_fee = 0.0
        total_amount = subtotal + platform_fee

        order = Order(
            buyer_id=buyer.id,
            seller_id=project.owner_id,
            project_id=project.id,
            credits_ordered=amount,
            price_per_credit=price_per_credit,
            subtotal=subtotal,
            platform_fee=platform_fee,
            total_amount=total_amount,
            currency=project.credit_currency,
            status="completed",
        )
        db.add(order)
        db.flush()

        transaction = Transaction(
            order_id=order.id,
            buyer_id=buyer.id,
            project_id=project.id,
            transaction_type="credit_purchase",
            amount=total_amount,
            credits=amount,
            currency=project.credit_currency,
            blockchain_tx_hash=blockchain_tx_hash,
            status="completed",
            transaction_metadata={
                "price_per_credit": price_per_credit,
                "seller_id": str(project.owner_id),
            },
        )
        db.add(transaction)
        db.flush()

        purchase = Purchase(
            buyer_id=buyer.id,
            project_id=project.id,
            order_id=order.id,
            transaction_id=transaction.id,
            credits_purchased=amount,
            price_per_credit=price_per_credit,
            total_price=total_amount,
            currency=project.credit_currency,
            blockchain_tx_hash=blockchain_tx_hash,
            status="completed",
        )
        db.add(purchase)

        project.credits_available = round(available_credits - amount, 6)
        project.credits_sold = round(float(project.credits_sold or 0) + amount, 6)

        if project.credits_available <= 0:
            project.status = "active"

        db.commit()

        db.refresh(project)
        db.refresh(order)
        db.refresh(transaction)
        db.refresh(purchase)

        return purchase, order, transaction, project
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Purchase could not be completed.",
        ) from exc


def list_user_purchases(db: Session, user: User) -> list[tuple[Purchase, Project]]:
    query = (
        db.query(Purchase, Project)
        .join(Project, Purchase.project_id == Project.id)
        .order_by(Purchase.created_at.desc())
    )

    if user.role == "company":
        query = query.filter(Purchase.buyer_id == user.id)
    elif user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only company or admin accounts can view purchase history.",
        )

    return query.all()


def list_orders(db: Session, user: User) -> list[tuple[Order, Project]]:
    query = (
        db.query(Order, Project)
        .join(Project, Order.project_id == Project.id)
        .order_by(Order.created_at.desc())
    )

    if user.role == "company":
        query = query.filter(Order.buyer_id == user.id)
    elif user.role in ["farmer", "ngo"]:
        query = query.filter(Order.seller_id == user.id)
    elif user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized access.",
        )

    return query.all()


def list_transactions(db: Session, user: User) -> list[Transaction]:
    query = db.query(Transaction).order_by(Transaction.created_at.desc())

    if user.role == "company":
        query = query.filter(Transaction.buyer_id == user.id)
    elif user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only company or admin accounts can view transactions.",
        )

    return query.all()


def marketplace_summary(db: Session) -> dict:
    projects = list_marketplace_projects(db)
    total_projects = len(projects)
    total_available = sum(available_credit_balance(project) for project in projects)
    total_sold = sum(float(project.credits_sold or 0) for project in projects)
    average_price = (
        sum(float(project.price_per_credit or 0) for project in projects) / total_projects
        if total_projects
        else 0.0
    )

    return {
        "total_projects": total_projects,
        "total_available_credits": round(total_available, 6),
        "total_credits_sold": round(total_sold, 6),
        "average_price_per_credit": round(average_price, 2),
        "currency": "INR",
    }
