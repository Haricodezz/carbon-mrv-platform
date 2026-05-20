from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from uuid import UUID
import os

from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.kyc_verification import KYCVerification
from app.models.land_verification import LandVerification
from app.models.audit_log import AuditLog
from app.core.dependencies import require_role
from app.schemas.admin import ProjectVerificationRequest, AuditLogResponse
from app.services.audit_service import audit_service


router = APIRouter(
    prefix="/api/auditor",
    tags=["Auditor"]
)


# ─────────────────────────────────────────────────────
# DASHBOARD METRICS — real counts from DB
# ─────────────────────────────────────────────────────
@router.get("/dashboard/metrics")
def get_auditor_metrics(
    db: Session = Depends(get_db),
    current_auditor: User = Depends(require_role(["auditor", "admin"]))
):
    pending_kyc = db.query(KYCVerification).filter(KYCVerification.status == "pending").count()
    pending_land = db.query(LandVerification).filter(LandVerification.verification_status == "pending").count()
    pending_projects = db.query(Project).filter(
        Project.lifecycle_status.in_(["land_verified", "satellite_verified", "auditor_review"])
    ).count()
    approved_projects = db.query(Project).filter(Project.audit_status == "approved").count()
    rejected_projects = db.query(Project).filter(Project.audit_status == "rejected").count()
    fraud_alerts = db.query(Project).filter(Project.fraud_risk_score > 50).count()
    recent_reviews = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(5).all()

    return {
        "pending_kyc": pending_kyc,
        "pending_land": pending_land,
        "pending_projects": pending_projects,
        "approved_projects": approved_projects,
        "rejected_projects": rejected_projects,
        "fraud_alerts": fraud_alerts,
        "total_pending": pending_kyc + pending_land + pending_projects,
        "recent_reviews": [
            {
                "id": str(r.id),
                "action_type": r.action_type,
                "target_type": r.target_type,
                "notes": r.notes,
                "risk_score": r.risk_score,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in recent_reviews
        ],
    }


# ─────────────────────────────────────────────────────
# SERVE UPLOADED DOCUMENT (KYC or Land) — secure
# ─────────────────────────────────────────────────────
@router.get("/document/serve")
def serve_document(
    path: str,
    db: Session = Depends(get_db),
    current_reviewer: User = Depends(require_role(["auditor", "admin"]))
):
    """Securely serve uploaded KYC or land documents. Generates signed Supabase URL if stored there, otherwise falls back to local."""
    from app.services.storage_service import generate_signed_url
    from fastapi.responses import RedirectResponse

    # Determine bucket
    bucket = None
    if "kyc-documents" in path or "kyc" in path:
        bucket = "kyc-documents"
    elif "land-documents" in path or "land" in path:
        bucket = "land-documents"

    if bucket:
        clean_path = path
        if "supabase.co" in path:
            parts = path.split(f"/{bucket}/")
            if len(parts) > 1:
                clean_path = parts[1]
        
        if clean_path.startswith(f"{bucket}/"):
            clean_path = clean_path[len(bucket) + 1:]

        signed_url = generate_signed_url(bucket, clean_path)
        if signed_url:
            return RedirectResponse(url=signed_url)

    # Fallback to local
    safe_path = os.path.normpath(path)
    if ".." in safe_path:
        raise HTTPException(status_code=403, detail="Access denied.")

    full_path = os.path.join(os.getcwd(), safe_path)
    if os.path.isfile(full_path):
        ext = safe_path.rsplit(".", 1)[-1].lower()
        media_map = {
            "pdf": "application/pdf",
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "webp": "image/webp",
        }
        media_type = media_map.get(ext, "application/octet-stream")
        return FileResponse(path=full_path, media_type=media_type)

    raise HTTPException(status_code=404, detail="Document not found.")


# ─────────────────────────────────────────────────────
# PENDING PROJECTS — land_verified and ready for audit
# ─────────────────────────────────────────────────────
@router.get("/projects/pending")
def get_pending_projects(
    db: Session = Depends(get_db),
    current_auditor: User = Depends(require_role(["auditor", "admin"]))
):
    projects = db.query(Project).filter(
        Project.lifecycle_status.in_(["land_verified", "satellite_verified", "ml_processing", "auditor_review"])
    ).all()

    result = []
    for project in projects:
        owner = db.query(User).filter(User.id == project.owner_id).first()
        land_docs = db.query(LandVerification).filter(LandVerification.project_id == project.id).all()
        result.append({
            "project_id": str(project.id),
            "project_name": project.project_name,
            "owner_id": str(project.owner_id),
            "owner_name": owner.full_name if owner else "Unknown",
            "owner_email": owner.email if owner else "",
            "location": project.location,
            "country": project.country,
            "land_area_acres": project.land_area_acres,
            "satellite_status": project.satellite_status,
            "audit_status": project.audit_status,
            "lifecycle_status": project.lifecycle_status,
            "ndvi_score": project.ndvi_score,
            "vegetation_health": project.vegetation_health,
            "total_biomass": project.total_biomass,
            "carbon_stock": project.carbon_stock,
            "co2e": project.co2e,
            "estimated_annual_credits": project.estimated_annual_credits,
            "fraud_risk_score": project.fraud_risk_score,
            "verification_notes": project.verification_notes,
            "land_docs": [
                {
                    "id": str(d.id),
                    "document_type": d.document_type,
                    "document_url": d.document_url,
                    "verification_status": d.verification_status,
                }
                for d in land_docs
            ],
        })

    return result


# ─────────────────────────────────────────────────────
# VERIFY / APPROVE / REJECT PROJECT
# ─────────────────────────────────────────────────────
@router.post("/projects/{project_id}/verify")
def verify_project(
    project_id: UUID,
    payload: ProjectVerificationRequest,
    db: Session = Depends(get_db),
    current_auditor: User = Depends(require_role(["auditor", "admin"]))
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.audit_status = payload.status
    project.verification_notes = payload.notes
    project.fraud_risk_score = payload.risk_score or project.fraud_risk_score

    if payload.status == "approved":
        # Auditor approval → awaiting admin credit issuance
        project.lifecycle_status = "approved_pending_credit_issue"
        project.status = "active"
        if not project.credits_available or project.credits_available == 0:
            project.credits_available = float(project.total_credits_generated or project.estimated_credits or 0)
    elif payload.status == "rejected":
        project.lifecycle_status = "rejected"
        project.status = "draft"

    audit_service.log_action(
        db, current_auditor.id, project.id, "project", payload.status,
        notes=payload.notes, risk_score=payload.risk_score
    )

    db.commit()
    return {
        "message": f"Project {payload.status}.",
        "lifecycle_status": project.lifecycle_status,
    }


# ─────────────────────────────────────────────────────
# FRAUD FLAG
# ─────────────────────────────────────────────────────
@router.post("/projects/{project_id}/fraud-flag")
def flag_project_fraud(
    project_id: UUID,
    notes: str = Body(..., embed=True),
    risk_score: float = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_auditor: User = Depends(require_role(["auditor", "admin"]))
):
    log = audit_service.flag_fraud(db, current_auditor.id, project_id, risk_score, notes)
    if not log:
        raise HTTPException(status_code=404, detail="Project not found")

    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        project.fraud_risk_score = risk_score
        db.commit()

    return {"message": "Project flagged for potential fraud", "audit_log_id": str(log.id)}


# ─────────────────────────────────────────────────────
# AUDIT LOGS
# ─────────────────────────────────────────────────────
@router.get("/logs", response_model=list[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_auditor: User = Depends(require_role(["auditor", "admin"]))
):
    return audit_service.get_logs(db)
