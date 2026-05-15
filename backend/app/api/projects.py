from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreateRequest
from app.core.dependencies import require_role, get_current_user


router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"]
)


@router.post("/create")
def create_project(
    request: ProjectCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["farmer", "ngo", "admin"])
    )
):
    project = Project(
        owner_id=current_user.id,
        project_name=request.project_name,
        description=request.description,
        project_type=request.project_type,
        # methodology=request.methodology,
        location=request.location,
        country=request.country,
        land_area_acres=request.land_area_acres,
        estimated_annual_credits=request.estimated_annual_credits,
        status="draft",
        audit_status="pending"
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return {
        "message": "Project created successfully.",
        "project_id": str(project.id),
        "status": project.status,
        "audit_status": project.audit_status
    }

@router.get("/my-projects")
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = db.query(Project).filter(
        Project.owner_id == current_user.id
    ).all()

    return [
        {
            "project_id": str(project.id),
            "project_name": project.project_name,
            "project_type": project.project_type,
            "location": project.location,
            "country": project.country,
            "land_area_acres": project.land_area_acres,
            "estimated_annual_credits": project.estimated_annual_credits,
            "status": project.status,
            "audit_status": project.audit_status,
            "created_at": project.created_at
        }
        for project in projects
    ]