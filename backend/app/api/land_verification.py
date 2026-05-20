"""
Land Verification API
Enforces business rule: a project CANNOT enter satellite/ML verification
without an approved land ownership document.
"""
import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.land_verification import LandVerification
from app.models.project import Project
from app.models.user import User
from app.core.dependencies import get_current_user, require_role
from app.services.audit_service import audit_service

router = APIRouter(prefix="/api/land-verification", tags=["Land Verification"])

ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/webp",
    "application/pdf",
}
from app.services.storage_service import upload_land_document as supabase_upload_land

VALID_DOC_TYPES = {"land_deed", "lease_certificate", "forest_rights"}


def _save_upload(file: UploadFile, project_id: str) -> str:
    """Validates and uploads file to Supabase Storage. Returns the stored file path."""
    content = file.file.read()
    try:
        storage_path = supabase_upload_land(
            file_content=content,
            project_id=project_id,
            filename=file.filename or "document.bin",
            content_type=file.content_type or "application/octet-stream"
        )
        return f"land-documents/{storage_path}"
    except ValueError as e:
        err_msg = str(e)
        if "size" in err_msg.lower():
            raise HTTPException(status_code=413, detail=err_msg)
        else:
            raise HTTPException(status_code=415, detail=err_msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload document to storage: {e}")


# ──────────────────────────────────────────────
# FARMER: UPLOAD LAND DOCUMENT
# ──────────────────────────────────────────────
@router.post("/{project_id}/upload")
def upload_land_document(
    project_id: str,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    if current_user.role not in ["farmer", "ngo", "nco", "admin"] and project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized.")

    if document_type not in VALID_DOC_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid document_type. Must be one of: {', '.join(VALID_DOC_TYPES)}"
        )

    file_path = _save_upload(file, project_id)

    land_doc = LandVerification(
        project_id=project_id,
        document_type=document_type,
        document_url=file_path,
        verification_status="pending",
    )
    db.add(land_doc)

    # Move lifecycle state forward
    if project.lifecycle_status == "submitted":
        project.lifecycle_status = "awaiting_land_verification"

    db.commit()
    db.refresh(land_doc)

    return {
        "message": "Land document uploaded. Awaiting auditor review.",
        "land_verification_id": str(land_doc.id),
        "document_type": land_doc.document_type,
        "status": land_doc.verification_status,
        "project_lifecycle": project.lifecycle_status,
    }


# ──────────────────────────────────────────────
# GET LAND VERIFICATION STATUS FOR A PROJECT
# ──────────────────────────────────────────────
@router.get("/{project_id}/status")
def get_land_status(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    docs = db.query(LandVerification).filter(
        LandVerification.project_id == project_id
    ).all()

    result = [
        {
            "id": str(d.id),
            "document_type": d.document_type,
            "verification_status": d.verification_status,
            "rejection_reason": d.rejection_reason,
            "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None,
            "verified_at": d.verified_at.isoformat() if d.verified_at else None,
        }
        for d in docs
    ]

    overall = "not_submitted"
    if docs:
        if any(d.verification_status == "approved" for d in docs):
            overall = "approved"
        elif any(d.verification_status == "rejected" for d in docs):
            overall = "rejected"
        else:
            overall = "pending"

    return {
        "project_id": project_id,
        "land_verification_status": overall,
        "documents": result,
        "lifecycle_status": project.lifecycle_status,
    }


# ──────────────────────────────────────────────
# AUDITOR/ADMIN: LIST ALL PENDING LAND DOCS
# ──────────────────────────────────────────────
@router.get("/pending/all")
def list_pending_land_docs(
    db: Session = Depends(get_db),
    current_reviewer: User = Depends(require_role(["auditor", "admin"])),
):
    pending = db.query(LandVerification).filter(
        LandVerification.verification_status == "pending"
    ).all()

    result = []
    for doc in pending:
        project = db.query(Project).filter(Project.id == doc.project_id).first()
        result.append({
            "land_id": str(doc.id),
            "project_id": str(doc.project_id),
            "project_name": project.project_name if project else "Unknown",
            "document_type": doc.document_type,
            "file_url": doc.document_url,
            "verification_status": doc.verification_status,
            "uploaded_at": doc.uploaded_at.isoformat() if doc.uploaded_at else None,
        })

    return result


# ──────────────────────────────────────────────
# AUDITOR/ADMIN: APPROVE LAND DOCUMENT
# ──────────────────────────────────────────────
@router.post("/{land_id}/approve")
def approve_land_document(
    land_id: str,
    db: Session = Depends(get_db),
    current_reviewer: User = Depends(require_role(["auditor", "admin"])),
):
    doc = db.query(LandVerification).filter(LandVerification.id == land_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Land verification document not found.")

    doc.verification_status = "approved"
    doc.verified_by = current_reviewer.id
    doc.verified_at = datetime.now(timezone.utc)

    # Advance project lifecycle — now eligible for satellite/ML pipeline
    project = db.query(Project).filter(Project.id == doc.project_id).first()
    if project:
        project.lifecycle_status = "land_verified"
        project.audit_status = "pending"  # Ready for satellite then auditor

    audit_service.log_action(
        db, current_reviewer.id, doc.project_id, "project", "land_approve",
        notes=f"Land document '{doc.document_type}' approved. Project eligible for ML pipeline."
    )

    db.commit()
    return {
        "message": "Land document approved. Project now eligible for satellite/ML verification.",
        "project_lifecycle": project.lifecycle_status if project else None,
    }


# ──────────────────────────────────────────────
# AUDITOR/ADMIN: REJECT LAND DOCUMENT
# ──────────────────────────────────────────────
@router.post("/{land_id}/reject")
def reject_land_document(
    land_id: str,
    rejection_reason: str = Form(...),
    db: Session = Depends(get_db),
    current_reviewer: User = Depends(require_role(["auditor", "admin"])),
):
    doc = db.query(LandVerification).filter(LandVerification.id == land_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Land verification document not found.")

    doc.verification_status = "rejected"
    doc.verified_by = current_reviewer.id
    doc.verified_at = datetime.now(timezone.utc)
    doc.rejection_reason = rejection_reason

    # Project stays in awaiting_land_verification
    project = db.query(Project).filter(Project.id == doc.project_id).first()
    if project:
        project.lifecycle_status = "awaiting_land_verification"

    audit_service.log_action(
        db, current_reviewer.id, doc.project_id, "project", "land_reject",
        notes=f"Land document rejected. Reason: {rejection_reason}"
    )

    db.commit()
    return {"message": "Land document rejected.", "reason": rejection_reason}
