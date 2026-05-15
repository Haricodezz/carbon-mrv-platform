from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.core.dependencies import require_role


router = APIRouter(
    prefix="/api/auditor",
    tags=["Auditor"]
)


@router.get("/projects/pending")
def get_pending_projects(
    db: Session = Depends(get_db),
    current_auditor: User = Depends(require_role(["auditor", "admin"]))
):
    projects = db.query(Project).filter(
        Project.audit_status == "pending"
    ).all()

    return [
        {
            "project_id": str(project.id),
            "project_name": project.project_name,
            "owner_id": str(project.owner_id),
            "location": project.location,
            "land_area_acres": project.land_area_acres,
            "estimated_annual_credits": project.estimated_annual_credits,
            "audit_status": project.audit_status
        }
        for project in projects
    ]


@router.post("/projects/{project_id}/approve")
def approve_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_auditor: User = Depends(require_role(["auditor", "admin"]))
):
    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found."
        )

    project.audit_status = "approved"
    project.status = "active"

    db.commit()

    return {
        "message": f"Project {project.project_name} approved successfully."
    }


@router.post("/projects/{project_id}/reject")
def reject_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_auditor: User = Depends(require_role(["auditor", "admin"]))
):
    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found."
        )

    project.audit_status = "rejected"
    project.status = "draft"

    db.commit()

    return {
        "message": f"Project {project.project_name} rejected."
    }