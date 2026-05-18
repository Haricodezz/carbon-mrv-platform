from celery import shared_task
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import SessionLocal
from app.models.project import Project
from app.services.planetary_computer_service import (
    verify_project_with_planetary_computer,
)


# =========================
# SINGLE PROJECT VERIFICATION
# =========================
@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    max_retries=3,
)
def verify_project_task(
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
            project.latitude
            is None
            or project.longitude
            is None
        ):
            return {
                "status": "error",
                "message": "Project missing coordinates.",
            }

        verification = (
            verify_project_with_planetary_computer(
                latitude=project.latitude,
                longitude=project.longitude,
                land_area_acres=project.land_area_acres,
            )
        )

        # Update project verification fields
        project.satellite_status = verification[
            "verification_status"
        ]

        if verification["verification_status"] == "rejected":
            project.audit_status = "pending"

        project.ndvi_score = verification[
            "ndvi_score"
        ]

        project.vegetation_health = verification[
            "vegetation_health"
        ]

        project.fraud_risk_score = verification[
            "fraud_risk"
        ]

        project.estimated_credits = verification[
            "estimated_credits"
        ]

        project.estimated_annual_credits = verification[
            "estimated_credits"
        ]

        project.agb_per_hectare = verification.get(
            "agb_per_hectare",
            0,
        )

        project.total_biomass = verification.get(
            "total_biomass",
            0,
        )

        project.carbon_stock = verification.get(
            "carbon_stock",
            0,
        )

        project.co2e = verification.get(
            "co2e",
            0,
        )

        project.verification_notes = verification[
            "verification_notes"
        ]

        db.commit()
        db.refresh(project)

        return {
            "status": "success",
            "project_id": str(
                project.id
            ),
            "verification_status": project.satellite_status,
        }

    finally:
        db.close()


# =========================
# DAILY MARKETPLACE RE-VERIFICATION
# =========================
@shared_task
def reverify_marketplace_projects():
    db: Session = SessionLocal()

    try:
        marketplace_projects = (
            db.query(Project)
            .filter(
                Project.status
                == "marketplace",
                Project.audit_status
                == "approved",
            )
            .all()
        )

        updated_projects = []

        for project in (
            marketplace_projects
        ):
            if (
                project.latitude
                is None
                or project.longitude
                is None
            ):
                continue

            verification = (
                verify_project_with_planetary_computer(
                    latitude=project.latitude,
                    longitude=project.longitude,
                    land_area_acres=project.land_area_acres,
                )
            )

            project.ndvi_score = verification[
                "ndvi_score"
            ]

            project.vegetation_health = verification[
                "vegetation_health"
            ]

            project.fraud_risk_score = verification[
                "fraud_risk"
            ]

            project.estimated_annual_credits = verification[
                "estimated_credits"
            ]

            project.agb_per_hectare = verification.get(
                "agb_per_hectare",
                0,
            )

            project.total_biomass = verification.get(
                "total_biomass",
                0,
            )

            project.carbon_stock = verification.get(
                "carbon_stock",
                0,
            )

            project.co2e = verification.get(
                "co2e",
                0,
            )

            project.verification_notes = verification[
                "verification_notes"
            ]

            # Fraud auto-downgrade
            if (
                project.fraud_risk_score
                > 65
            ):
                project.audit_status = (
                    "flagged"
                )

            updated_projects.append(
                str(project.id)
            )

        db.commit()

        return {
            "status": "success",
            "updated_projects": updated_projects,
            "count": len(
                updated_projects
            ),
        }

    finally:
        db.close()
