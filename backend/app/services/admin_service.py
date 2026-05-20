from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.project import Project
from app.models.purchase import Purchase
from app.models.transaction import Transaction
from app.models.order import Order

class AdminService:
    @staticmethod
    def get_dashboard_metrics(db: Session):
        total_users = db.query(User).count()
        companies = db.query(User).filter(User.role == "company", User.is_active == True).count()
        farmers = db.query(User).filter(User.role == "farmer", User.is_active == True).count()
        ngos = db.query(User).filter(User.role.in_(["ngo", "nco"]), User.is_active == True).count()
        auditors = db.query(User).filter(User.role == "auditor", User.is_active == True).count()

        total_projects = db.query(Project).count()
        verified_projects = db.query(Project).filter(Project.audit_status == "approved").count()
        pending_projects = db.query(Project).filter(Project.audit_status == "pending").count()
        rejected_projects = db.query(Project).filter(Project.audit_status == "rejected").count()

        total_credits = db.query(func.sum(Project.total_credits_generated)).scalar() or 0.0
        total_revenue = db.query(func.sum(Purchase.total_price)).scalar() or 0.0
        
        total_carbon_stock = db.query(func.sum(Project.carbon_stock)).scalar() or 0.0
        marketplace_volume = db.query(func.sum(Order.total_amount)).scalar() or 0.0
        
        satellite_verified = db.query(Project).filter(Project.satellite_status == "verified").count()
        avg_ndvi = db.query(func.avg(Project.ndvi_score)).scalar() or 0.0
        avg_agb = db.query(func.avg(Project.agb_per_hectare)).scalar() or 0.0
        
        fraud_alerts = db.query(Project).filter(Project.fraud_risk_score > 70).count()

        return {
            "total_users": total_users,
            "total_projects": total_projects,
            "verified_projects": verified_projects,
            "pending_verifications": pending_projects,
            "total_credits_sold": float(total_credits),
            "total_revenue_inr": float(total_revenue),
            "active_companies": companies,
            "active_farmers": farmers,
            "active_ngos": ngos,
            "active_auditors": auditors,
            "rejected_projects": rejected_projects,
            "total_carbon_stock": float(total_carbon_stock),
            "marketplace_volume": float(marketplace_volume),
            "satellite_verified": satellite_verified,
            "avg_ndvi": float(avg_ndvi),
            "avg_agb": float(avg_agb),
            "fraud_alerts": fraud_alerts
        }

    @staticmethod
    def list_users(db: Session, role: str = None):
        query = db.query(User)
        if role:
            query = query.filter(User.role == role)
        return query.order_by(User.created_at.desc()).all()

    @staticmethod
    def list_fraud_reports(db: Session):
        return db.query(Project).filter(Project.fraud_risk_score > 50).order_by(Project.fraud_risk_score.desc()).all()

    @staticmethod
    def toggle_user_status(db: Session, user_id: str, is_active: bool):
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_active = is_active
            db.commit()
            db.refresh(user)
            return user
        return None

admin_service = AdminService()
