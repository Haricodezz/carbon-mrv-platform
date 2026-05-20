from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import require_role
from app.schemas.admin import (
    DashboardMetrics, 
    UserAdminResponse, 
    UserModerationRequest, 
    FraudReportResponse
)
from app.services.admin_service import admin_service
from app.services.audit_service import audit_service


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)


@router.get("/dashboard", response_model=DashboardMetrics)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(["admin"]))
):
    return admin_service.get_dashboard_metrics(db)


@router.get("/users", response_model=list[UserAdminResponse])
def get_all_users(
    role: str = Query(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(["admin"]))
):
    return admin_service.list_users(db, role=role)


@router.post("/users/{user_id}/moderate")
def moderate_user(
    user_id: UUID,
    payload: UserModerationRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(["admin"]))
):
    user = admin_service.toggle_user_status(db, str(user_id), payload.is_active)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log Action
    action = "user_activate" if payload.is_active else "user_suspend"
    audit_service.log_action(
        db, 
        current_admin.id, 
        user.id, 
        "user", 
        action, 
        notes=payload.notes
    )

    return {"message": f"User status updated to {'active' if payload.is_active else 'suspended'}"}


@router.get("/fraud-reports", response_model=list[FraudReportResponse])
def get_fraud_reports(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(["admin"]))
):
    projects = admin_service.list_fraud_reports(db)
    return [
        {
            "project_id": project.id,
            "project_name": project.project_name,
            "fraud_risk_score": project.fraud_risk_score,
            "status": project.status,
            "verification_notes": project.verification_notes
        }
        for project in projects
    ]
