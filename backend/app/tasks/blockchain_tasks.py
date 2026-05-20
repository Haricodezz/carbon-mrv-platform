from celery import shared_task
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import SessionLocal
from app.models.project import Project
from app.models.user import User
from app.services.blockchain_service import mint_credits


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    max_retries=3,
)
def mint_project_credits_task(
    self,
    project_id: str,
):
    db: Session = SessionLocal()

    try:
        project = (
            db.query(Project)
            .filter(
                Project.id == UUID(str(project_id))
            )
            .first()
        )

        if not project:
            return {
                "status": "error",
                "message": "Project not found.",
            }

        if (
            project.audit_status
            != "approved"
        ):
            return {
                "status": "error",
                "message": "Project not approved.",
            }

        owner = (
            db.query(User)
            .filter(
                User.id == project.owner_id
            )
            .first()
        )

        if (
            not owner
            or not owner.wallet_verified
            or not owner.wallet_address
        ):
            return {
                "status": "error",
                "message": "Owner wallet not verified.",
            }

        if (
            not project.estimated_credits
            or project.estimated_credits <= 0
        ):
            return {
                "status": "error",
                "message": "Invalid credit amount.",
            }

        blockchain_result = mint_credits(
            recipient_wallet=owner.wallet_address,
            amount=project.estimated_credits,
            project_id=str(project.id),
        )

        project.blockchain_tx_hash = (
            blockchain_result["tx_hash"]
        )

        project.tokenized = True

        project.total_credits_generated = (
            project.estimated_credits
        )

        project.first_issuance_credits = (
            project.estimated_credits
        )

        # Sync with internal wallet and credit ownership
        from app.services.wallet_service import wallet_service
        from app.models.credit_ownership import CreditOwnership
        
        # 1. Update wallet balance
        wallet_service.update_balances_from_purchase(db, owner.id, float(project.estimated_credits))
        
        # 2. Update credit ownership ledger
        ownership = db.query(CreditOwnership).filter(
            CreditOwnership.owner_id == owner.id,
            CreditOwnership.project_id == project.id
        ).first()
        
        if not ownership:
            ownership = CreditOwnership(
                owner_id=owner.id,
                project_id=project.id,
                total_credits_owned=float(project.estimated_credits)
            )
            db.add(ownership)
        else:
            ownership.total_credits_owned += float(project.estimated_credits)

        db.commit()
        db.refresh(project)

        return {
            "status": "success",
            "project_id": str(project.id),
            "tx_hash": project.blockchain_tx_hash,
            "credits": project.total_credits_generated,
        }

    finally:
        db.close()
