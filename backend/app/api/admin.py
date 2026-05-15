from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.payment import Payment
from app.models.certificate import Certificate
from app.core.dependencies import require_role


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)


@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(["admin"]))
):
    total_users = db.query(User).count()
    total_projects = db.query(Project).count()
    total_payments = db.query(Payment).count()
    total_certificates = db.query(Certificate).count()

    return {
        "admin": current_admin.email,
        "total_users": total_users,
        "total_projects": total_projects,
        "total_payments": total_payments,
        "total_certificates": total_certificates
    }


@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(["admin"]))
):
    users = db.query(User).all()

    return [
        {
            "id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_verified": user.is_verified,
            "is_active": user.is_active
        }
        for user in users
    ]