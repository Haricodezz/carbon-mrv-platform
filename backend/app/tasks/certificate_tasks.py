from celery import shared_task
from sqlalchemy.orm import Session
from pathlib import Path
from uuid import UUID

from app.db.session import SessionLocal
from app.models.project import Project
from app.models.user import User
from app.services.certificate_service import (
    generate_project_certificate,
)
from app.core.config import settings


# =========================
# GENERATE CERTIFICATE TASK
# =========================
@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    max_retries=3,
)
def generate_certificate_task(
    self,
    project_id: str,
):
    db: Session = SessionLocal()

    try:
        project = (
            db.query(Project)
            .filter(
                Project.id
                == UUID(str(project_id))
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
                "message": "Project is not approved.",
            }

        owner = (
            db.query(User)
            .filter(User.id == project.owner_id)
            .first()
        )

        if not owner:
            return {
                "status": "error",
                "message": "Project owner not found.",
            }

        # Ensure storage directory exists
        storage_path = Path(
            settings.CERTIFICATE_STORAGE_PATH
        )

        storage_path.mkdir(
            parents=True,
            exist_ok=True,
        )

        # Generate certificate
        certificate_path = (
            generate_project_certificate(
                project=project,
                owner=owner,
            )
        )

        return {
            "status": "success",
            "project_id": str(
                project.id
            ),
            "certificate_path": certificate_path,
        }

    finally:
        db.close()
