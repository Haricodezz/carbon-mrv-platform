from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.models.user import User
from app.models.notification import Notification
from app.core.dependencies import get_current_user
from app.schemas.notification import NotificationResponse

router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"]
)

@router.get("/", response_model=list[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()

@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if notification:
        notification.is_read = True
        db.commit()
    
    return {"status": "success"}
