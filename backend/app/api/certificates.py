from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime

from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.core.dependencies import get_current_user
from app.services.certificate_generator import (
    generate_certificate_pdf,
)


router = APIRouter(
    prefix="/api/certificates",
    tags=["Certificates"]
)


@router.get("/")
def get_user_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    projects = db.query(Project).filter(
        Project.owner_id == current_user.id,
        Project.status == "retired",
    ).all()

    certificates = []

    for project in projects:
        certificates.append(
            {
                "certificate_id": f"CERT-{str(uuid4())[:8]}",
                "project_id": str(project.id),
                "project_name": project.project_name,
                "credits_retired": project.total_credits_generated,
                "issued_to": current_user.full_name,
                "blockchain_tx_hash": project.blockchain_tx_hash,
                "issued_at": datetime.utcnow(),
                "status": "verified",
            }
        )

    return certificates


@router.get("/{project_id}")
def get_project_certificate(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id,
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found."
        )

    if project.status != "retired":
        raise HTTPException(
            status_code=400,
            detail="Project must be retired before certificate issuance."
        )

    return {
        "certificate_id": f"CERT-{str(uuid4())[:8]}",
        "project_id": str(project.id),
        "project_name": project.project_name,
        "credits_retired": project.total_credits_generated,
        "issued_to": current_user.full_name,
        "blockchain_tx_hash": project.blockchain_tx_hash,
        "issued_at": datetime.utcnow(),
        "verification_status": "verified",
        "compliance_standard": "Carbon MRV ESG Protocol",
    }


@router.get("/{project_id}/download")
def download_certificate(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id,
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found."
        )

    if project.status != "retired":
        raise HTTPException(
            status_code=400,
            detail="Project must be retired before certificate generation."
        )

    certificate_data = {
        "certificate_id": f"CERT-{str(uuid4())[:8]}",
        "project_name": project.project_name,
        "credits_retired": project.total_credits_generated,
        "issued_to": current_user.full_name,
        "blockchain_tx_hash": project.blockchain_tx_hash,
    }

    pdf_path = generate_certificate_pdf(
        certificate_data
    )

    return FileResponse(
        path=pdf_path,
        filename=f"{certificate_data['certificate_id']}.pdf",
        media_type="application/pdf",
    )