from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User
from app.models.wallet import Wallet
from app.core.security import hash_password
from app.core.config import settings


def create_default_auditor():
    db: Session = SessionLocal()

    auditor_email = settings.DEFAULT_AUDITOR_EMAIL
    existing_auditor = db.query(User).filter(
        User.email == auditor_email
    ).first()

    if existing_auditor:
        db.close()
        return

    auditor = User(
        full_name="Government Auditor",
        email=auditor_email,
        password_hash=hash_password(settings.DEFAULT_AUDITOR_PASSWORD),
        role="auditor",
        is_verified=True,
        is_active=True,
        kyc_completed=True,
        organization_name="Carbon Regulatory Authority"
    )

    db.add(auditor)
    db.commit()
    db.refresh(auditor)

    wallet = Wallet(
        user_id=auditor.id
    )

    db.add(wallet)
    db.commit()

    db.close()