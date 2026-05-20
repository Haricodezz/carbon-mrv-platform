"""
KYC Verification API
Handles document upload, status checks, and admin/auditor review for KYC.
Roles that require KYC: farmer, ngo, nco, company
Trusted internal roles (no KYC needed): admin, auditor
"""
import os
import uuid
import shutil
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.kyc_verification import KYCVerification
from app.models.user import User
from app.models.audit_log import AuditLog
from app.core.dependencies import get_current_user, require_role
from app.services.audit_service import audit_service

router = APIRouter(prefix="/api/kyc", tags=["KYC"])

TRUSTED_ROLES = {"admin", "auditor"}
KYC_REQUIRED_ROLES = {"farmer", "ngo", "nco", "company"}

ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/webp",
    "application/pdf",
}
MAX_FILE_SIZE_MB = 10
KYC_UPLOAD_DIR = "uploads/kyc"

from app.services.storage_service import upload_kyc_document as supabase_upload_kyc

VALID_DOCUMENT_TYPES = {
    "govt_id", "selfie", "org_registration", "address_proof"
}


def _save_upload(file: UploadFile, user_id: str) -> str:
    """Validates and uploads file to Supabase Storage. Returns the stored file path."""
    content = file.file.read()
    try:
        storage_path = supabase_upload_kyc(
            file_content=content,
            user_id=user_id,
            filename=file.filename or "document.bin",
            content_type=file.content_type or "application/octet-stream"
        )
        return f"kyc-documents/{storage_path}"
    except ValueError as e:
        err_msg = str(e)
        if "size" in err_msg.lower():
            raise HTTPException(status_code=413, detail=err_msg)
        else:
            raise HTTPException(status_code=415, detail=err_msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload document to storage: {e}")


# ──────────────────────────────────────────────
# UPLOAD KYC DOCUMENT
# ──────────────────────────────────────────────
@router.post("/upload")
def upload_kyc_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role in TRUSTED_ROLES:
        raise HTTPException(
            status_code=400,
            detail="Admin and Auditor roles do not require KYC verification."
        )

    if document_type not in VALID_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid document_type. Must be one of: {', '.join(VALID_DOCUMENT_TYPES)}"
        )

    file_path = _save_upload(file, str(current_user.id))

    kyc = KYCVerification(
        user_id=current_user.id,
        document_type=document_type,
        file_url=file_path,
        status="pending",
    )
    db.add(kyc)
    db.commit()
    db.refresh(kyc)

    return {
        "message": "KYC document uploaded successfully.",
        "kyc_id": str(kyc.id),
        "document_type": kyc.document_type,
        "status": kyc.status,
    }


# ──────────────────────────────────────────────
# GET MY KYC STATUS
# ──────────────────────────────────────────────
@router.get("/status")
def get_my_kyc_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Trusted internal roles are always verified
    if current_user.role in TRUSTED_ROLES:
        return {"kyc_status": "verified", "documents": [], "is_trusted_role": True}

    docs = db.query(KYCVerification).filter(
        KYCVerification.user_id == current_user.id
    ).all()

    result = [
        {
            "id": str(d.id),
            "document_type": d.document_type,
            "status": d.status,
            "rejection_reason": d.rejection_reason,
            "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None,
            "reviewed_at": d.reviewed_at.isoformat() if d.reviewed_at else None,
        }
        for d in docs
    ]

    # Determine overall KYC status
    if not docs:
        overall = "not_submitted"
    elif all(d.status == "approved" for d in docs):
        overall = "approved"
    elif any(d.status == "rejected" for d in docs):
        overall = "rejected"
    else:
        overall = "pending"

    return {
        "kyc_status": overall,
        "documents": result,
        "is_trusted_role": False,
    }


# ──────────────────────────────────────────────
# ADMIN/AUDITOR: LIST ALL PENDING KYC
# ──────────────────────────────────────────────
@router.get("/pending")
def list_pending_kyc(
    db: Session = Depends(get_db),
    current_reviewer: User = Depends(require_role(["admin", "auditor"])),
):
    pending = db.query(KYCVerification).filter(
        KYCVerification.status == "pending"
    ).all()

    result = []
    for doc in pending:
        user = db.query(User).filter(User.id == doc.user_id).first()
        result.append({
            "kyc_id": str(doc.id),
            "user_id": str(doc.user_id),
            "user_name": user.full_name if user else "Unknown",
            "user_email": user.email if user else "",
            "user_role": user.role if user else "",
            "document_type": doc.document_type,
            "file_url": doc.file_url,
            "status": doc.status,
            "uploaded_at": doc.uploaded_at.isoformat() if doc.uploaded_at else None,
        })

    return result


# ──────────────────────────────────────────────
# ADMIN/AUDITOR: APPROVE KYC DOCUMENT
# ──────────────────────────────────────────────
@router.post("/{kyc_id}/approve")
def approve_kyc(
    kyc_id: str,
    db: Session = Depends(get_db),
    current_reviewer: User = Depends(require_role(["admin", "auditor"])),
):
    doc = db.query(KYCVerification).filter(
        KYCVerification.id == kyc_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="KYC document not found.")

    doc.status = "approved"
    doc.reviewed_by = current_reviewer.id
    doc.reviewed_at = datetime.now(timezone.utc)

    # Check if all docs for that user are approved → mark user KYC complete
    user = db.query(User).filter(User.id == doc.user_id).first()
    if user:
        all_docs = db.query(KYCVerification).filter(
            KYCVerification.user_id == doc.user_id
        ).all()
        if all(d.status == "approved" for d in all_docs):
            user.kyc_completed = True
            user.is_verified = True

    audit_service.log_action(
        db, current_reviewer.id, doc.user_id, "user", "kyc_approve",
        notes=f"KYC document '{doc.document_type}' approved."
    )

    db.commit()
    return {"message": "KYC document approved.", "kyc_id": kyc_id}


# ──────────────────────────────────────────────
# ADMIN/AUDITOR: REJECT KYC DOCUMENT
# ──────────────────────────────────────────────
@router.post("/{kyc_id}/reject")
def reject_kyc(
    kyc_id: str,
    rejection_reason: str = Form(...),
    db: Session = Depends(get_db),
    current_reviewer: User = Depends(require_role(["admin", "auditor"])),
):
    doc = db.query(KYCVerification).filter(
        KYCVerification.id == kyc_id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="KYC document not found.")

    doc.status = "rejected"
    doc.reviewed_by = current_reviewer.id
    doc.reviewed_at = datetime.now(timezone.utc)
    doc.rejection_reason = rejection_reason

    audit_service.log_action(
        db, current_reviewer.id, doc.user_id, "user", "kyc_reject",
        notes=f"KYC document '{doc.document_type}' rejected. Reason: {rejection_reason}"
    )

    db.commit()
    return {"message": "KYC document rejected.", "kyc_id": kyc_id}
