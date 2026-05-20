from uuid import UUID
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.project import Project

class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        actor_id: UUID,
        target_id: UUID,
        target_type: str,
        action_type: str,
        notes: str = None,
        risk_score: float = 0.0,
        metadata: dict = None,
        blockchain_ref: str = None
    ):
        log = AuditLog(
            actor_id=actor_id,
            target_id=target_id,
            target_type=target_type,
            action_type=action_type,
            notes=notes,
            risk_score=risk_score,
            metadata_json=metadata,
            blockchain_reference=blockchain_ref
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def get_logs(db: Session, target_id: UUID = None, action_type: str = None):
        query = db.query(AuditLog)
        if target_id:
            query = query.filter(AuditLog.target_id == target_id)
        if action_type:
            query = query.filter(AuditLog.action_type == action_type)
        return query.order_by(AuditLog.created_at.desc()).all()

    @staticmethod
    def flag_fraud(db: Session, actor_id: UUID, project_id: UUID, risk_score: float, notes: str):
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            project.fraud_risk_score = risk_score
            project.verification_notes = notes
            db.commit()
            
            return AuditService.log_action(
                db, actor_id, project_id, "project", "fraud_flag", 
                notes=notes, risk_score=risk_score
            )
        return None

audit_service = AuditService()
