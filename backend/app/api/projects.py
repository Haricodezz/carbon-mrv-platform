from uuid import UUID
import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.project import Project
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.project import ProjectCreate
from app.schemas.project import ProjectUpdate

from app.services.certificate_service import (
    generate_project_certificate,
)

from app.tasks.project_tasks import (
    verify_project_task,
)
from app.tasks.certificate_tasks import (
    generate_certificate_task,
)
from app.tasks.blockchain_tasks import (
    mint_project_credits_task,
)


router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"],
)


def _parse_project_id(project_id: str) -> UUID:
    try:
        return UUID(str(project_id))
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid project ID.",
        )


def _get_project_or_404(db: Session, project_id: str) -> Project:
    project = db.query(Project).filter(
        Project.id == _parse_project_id(project_id)
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    return project


def _normalize_polygon_coordinates(raw_polygon: str):
    # Deferred GIS imports — avoids slow startup if these libs are heavy
    from shapely.geometry import Polygon
    from pyproj import Geod

    try:
        payload = json.loads(raw_polygon)
    except json.JSONDecodeError as exc:
        raise ValueError("Polygon coordinates must be valid JSON.") from exc

    if isinstance(payload, dict):
        geometry = payload.get("geometry", payload)
        geo_type = geometry.get("type")

        if geo_type == "Feature":
            geometry = geometry.get("geometry", {})
            geo_type = geometry.get("type")

        if geo_type == "Polygon":
            coordinates = geometry.get("coordinates", [])
            points = coordinates[0] if coordinates else []
        elif geo_type == "MultiPolygon":
            coordinates = geometry.get("coordinates", [])
            points = coordinates[0][0] if coordinates and coordinates[0] else []
        else:
            raise ValueError("GeoJSON must be a Polygon or MultiPolygon.")
    else:
        points = payload

    if not isinstance(points, list) or len(points) < 3:
        raise ValueError("Polygon requires at least three coordinate points.")

    normalized_points = []
    for point in points:
        if isinstance(point, dict):
            lng = point.get("lng", point.get("longitude"))
            lat = point.get("lat", point.get("latitude"))
        elif isinstance(point, (list, tuple)) and len(point) >= 2:
            lng, lat = point[0], point[1]
        else:
            raise ValueError("Each polygon point must contain longitude and latitude.")

        try:
            lng = float(lng)
            lat = float(lat)
        except (TypeError, ValueError) as exc:
            raise ValueError("Polygon coordinates must be numeric.") from exc

        if not -180 <= lng <= 180 or not -90 <= lat <= 90:
            raise ValueError("Polygon coordinates are outside valid latitude/longitude ranges.")

        normalized_points.append([lng, lat])

    if normalized_points[0] != normalized_points[-1]:
        normalized_points.append(normalized_points[0])

    polygon = Polygon(normalized_points)

    if not polygon.is_valid or polygon.is_empty or polygon.area == 0:
        raise ValueError("Invalid polygon boundary.")

    centroid = polygon.centroid
    geod = Geod(ellps="WGS84")
    lons = [point[0] for point in normalized_points]
    lats = [point[1] for point in normalized_points]
    area, _ = geod.polygon_area_perimeter(lons, lats)
    land_area_acres = round(abs(area) * 0.000247105, 2)

    return {
        "polygon_coordinates": json.dumps(normalized_points),
        "latitude": centroid.y,
        "longitude": centroid.x,
        "land_area_acres": land_area_acres,
    }


def _process_polygon_or_400(raw_polygon: str | None):
    if not raw_polygon:
        return {
            "polygon_coordinates": None,
            "latitude": None,
            "longitude": None,
            "land_area_acres": 0.0,
        }

    try:
        return _normalize_polygon_coordinates(raw_polygon)
    except ValueError as polygon_error:
        raise HTTPException(
            status_code=400,
            detail=f"Polygon processing failed: {str(polygon_error)}",
        )


def _run_task_now(task, *args):
    try:
        return task.run(*args)
    except AttributeError:
        return task(*args)


def _assert_project_access(project: Project, current_user: User):
    if current_user.role in ["admin", "auditor"]:
        return

    if current_user.role in ["farmer", "ngo", "nco"] and project.owner_id == current_user.id:
        return

    if (
        current_user.role == "company"
        and project.status in ["marketplace", "active"]
        and project.audit_status == "approved"
    ):
        return

    raise HTTPException(
        status_code=403,
        detail="Unauthorized access.",
    )


@router.post("/")
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [
        "farmer",
        "ngo",
        "nco",
        "admin",
    ]:
        raise HTTPException(
            status_code=403,
            detail="Only farmers, NGOs, NCOs, or admins can create projects.",
        )

    polygon_data = _process_polygon_or_400(
        project_data.polygon_coordinates
    )

    new_project = Project(
        owner_id=current_user.id,
        project_name=project_data.project_name,
        project_type=project_data.project_type,
        location=project_data.location,
        country=project_data.country,
        latitude=polygon_data["latitude"],
        longitude=polygon_data["longitude"],
        polygon_coordinates=polygon_data["polygon_coordinates"],
        land_area_acres=polygon_data["land_area_acres"],
        description=project_data.description,
        satellite_status="pending",
        audit_status="pending",
        status="draft",
        lifecycle_status="submitted",  # Enterprise lifecycle begins
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return {
        "message": "Project submitted. Please upload land ownership proof to continue.",
        "project_id": str(new_project.id),
        "project_name": new_project.project_name,
        "project_type": new_project.project_type,
        "country": new_project.country,
        "location": new_project.location,
        "latitude": new_project.latitude,
        "longitude": new_project.longitude,
        "land_area_acres": new_project.land_area_acres,
        "status": new_project.status,
        "lifecycle_status": new_project.lifecycle_status,
        "next_step": "Upload land ownership document at /api/land-verification/{project_id}/upload",
    }


@router.get("/")
def get_all_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role in [
        "admin",
        "auditor",
    ]:
        projects = db.query(Project).all()

    elif current_user.role in [
        "farmer",
        "ngo",
        "nco",
    ]:
        projects = db.query(Project).filter(
            Project.owner_id == current_user.id
        ).all()

    elif current_user.role == "company":
        projects = db.query(Project).filter(
            Project.status == "marketplace",
            Project.audit_status == "approved",
        ).all()

    else:
        raise HTTPException(
            status_code=403,
            detail="Unauthorized role.",
        )

    return projects


@router.patch("/{project_id}")
def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = _get_project_or_404(db, project_id)

    if current_user.role not in ["admin"] and project.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Unauthorized access.",
        )

    if project.audit_status == "approved" and current_user.role != "admin":
        raise HTTPException(
            status_code=400,
            detail="Approved projects can only be changed by an admin.",
        )

    updates = project_data.model_dump(exclude_unset=True)

    if "polygon_coordinates" in updates:
        polygon_data = _process_polygon_or_400(
            updates.pop("polygon_coordinates")
        )
        for key, value in polygon_data.items():
            setattr(project, key, value)
        project.satellite_status = "pending"
        project.audit_status = "pending"
        project.status = "draft"

    for field, value in updates.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    return project


@router.get("/{project_id}")
def get_project_details(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = _get_project_or_404(db, project_id)
    _assert_project_access(project, current_user)

    return project


@router.get("/{project_id}/certificate")
def download_project_certificate(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = _get_project_or_404(db, project_id)
    _assert_project_access(project, current_user)

    allowed_roles = [
        "admin",
        "auditor",
        "farmer",
        "ngo",
        "company",
    ]

    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="Unauthorized access.",
        )

    owner = db.query(User).filter(
        User.id == project.owner_id
    ).first()

    if not owner:
        raise HTTPException(
            status_code=404,
            detail="Project owner not found.",
        )

    certificate_path = generate_project_certificate(
        project=project,
        owner=owner,
    )

    if certificate_path.startswith("http://") or certificate_path.startswith("https://"):
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=certificate_path)

    return FileResponse(
        path=certificate_path,
        media_type="application/pdf",
        filename=f"{project.project_name}_certificate.pdf",
    )


@router.post("/{project_id}/satellite-verify")
def satellite_verify_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [
        "admin",
        "auditor",
    ]:
        raise HTTPException(
            status_code=403,
            detail="Only admin or auditor can verify projects.",
        )

    project = _get_project_or_404(db, project_id)

    result = _run_task_now(
        verify_project_task,
        project_id
    )

    return {
        "message": "Satellite verification completed.",
        "project_id": project_id,
        "status": result.get("verification_status", result.get("status", "completed")),
        "result": result,
    }


@router.post("/{project_id}/approve")
def approve_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [
        "admin",
        "auditor",
    ]:
        raise HTTPException(
            status_code=403,
            detail="Only admin or auditor can approve projects.",
        )

    project = _get_project_or_404(db, project_id)

    if project.audit_status == "approved":
        raise HTTPException(
            status_code=400,
            detail="Project already approved.",
        )

    if project.satellite_status != "verified":
        raise HTTPException(
            status_code=400,
            detail="Project must pass satellite verification before approval.",
        )

    project.audit_status = "approved"
    # Auditor approval moves to awaiting admin credit issuance — NOT directly to marketplace
    project.status = "active"
    project.lifecycle_status = "approved_pending_credit_issue"
    if not project.credits_available:
        project.credits_available = float(
            project.total_credits_generated or project.estimated_credits or 0
        )

    db.commit()
    db.refresh(project)

    # Generate certificate immediately upon auditor approval
    certificate_result = _run_task_now(
        generate_certificate_task,
        project_id
    )

    db.refresh(project)

    return {
        "message": "Project approved by auditor. Awaiting Admin credit issuance.",
        "project_id": str(project.id),
        "status": project.status,
        "lifecycle_status": project.lifecycle_status,
        "audit_status": project.audit_status,
        "certificate": certificate_result,
        "next_step": "Admin must approve credit issuance via /api/projects/{id}/issue-credits",
    }


@router.post("/{project_id}/publish")
def publish_project_to_marketplace(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [
        "admin",
        "auditor",
    ]:
        raise HTTPException(
            status_code=403,
            detail="Only admin or auditor can publish projects.",
        )

    project = _get_project_or_404(db, project_id)

    if project.audit_status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Only approved projects can be published.",
        )

    project.status = "marketplace"
    if not project.credits_available:
        project.credits_available = float(
            project.total_credits_generated or project.estimated_credits or 0
        )
    db.commit()
    db.refresh(project)

    return {
        "message": "Project published to marketplace.",
        "project_id": str(project.id),
        "status": project.status,
        "audit_status": project.audit_status,
        "tokenized": project.tokenized,
    }


@router.post("/{project_id}/reject")
def reject_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [
        "admin",
        "auditor",
    ]:
        raise HTTPException(
            status_code=403,
            detail="Only admin or auditor can reject projects.",
        )

    project = _get_project_or_404(db, project_id)

    project.audit_status = "rejected"
    project.status = "draft"
    project.lifecycle_status = "rejected"

    db.commit()
    db.refresh(project)

    return {
        "message": "Project rejected.",
        "project_id": str(project.id),
        "lifecycle_status": project.lifecycle_status,
    }


@router.post("/{project_id}/issue-credits")
def admin_issue_credits(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """ADMIN-ONLY: Final credit issuance gate. Mints credits and activates marketplace listing."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only Admin can issue carbon credits.",
        )

    project = _get_project_or_404(db, project_id)

    if project.lifecycle_status != "approved_pending_credit_issue":
        raise HTTPException(
            status_code=400,
            detail=f"Project must be in 'approved_pending_credit_issue' state. Current: {project.lifecycle_status}",
        )

    if project.credits_issued:
        raise HTTPException(
            status_code=400,
            detail="Credits have already been issued for this project.",
        )

    # Activate marketplace listing
    project.status = "marketplace"
    project.lifecycle_status = "marketplace_active"
    project.credits_issued = True
    from datetime import datetime, timezone
    project.credits_issued_at = datetime.now(timezone.utc)
    project.issued_by = current_user.id

    if not project.credits_available or project.credits_available == 0:
        project.credits_available = float(
            project.total_credits_generated or project.estimated_credits or 0
        )

    db.commit()
    db.refresh(project)

    # Mint on blockchain
    blockchain_result = _run_task_now(mint_project_credits_task, project_id)

    # Log issuance event
    from app.models.audit_log import AuditLog
    log = AuditLog(
        actor_id=current_user.id,
        target_id=project.id,
        target_type="project",
        action_type="credit_issuance",
        notes=f"Admin issued {project.credits_available} credits. Marketplace activated.",
    )
    db.add(log)
    db.commit()

    db.refresh(project)

    return {
        "message": "Credits issued successfully. Project is now live on the marketplace.",
        "project_id": str(project.id),
        "lifecycle_status": project.lifecycle_status,
        "credits_available": project.credits_available,
        "blockchain": blockchain_result,
        "issued_by": str(current_user.id),
    }


@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admin can delete projects.",
        )

    project = _get_project_or_404(db, project_id)

    db.delete(project)
    db.commit()

    return {
        "message": "Project deleted successfully."
    }
