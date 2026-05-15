from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User
from app.models.wallet import Wallet
from app.core.security import hash_password
from app.core.config import settings


def create_default_admin():
    db: Session = SessionLocal()

    existing_admin = db.query(User).filter(
        User.email == settings.DEFAULT_ADMIN_EMAIL
    ).first()

    if existing_admin:
        db.close()
        return

    admin = User(
        full_name="Platform Admin",
        email=settings.DEFAULT_ADMIN_EMAIL,
        password_hash=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
        role="admin",
        is_verified=True,
        is_active=True,
        kyc_completed=True,
        organization_name="Carbon MRV Platform"
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    wallet = Wallet(
        user_id=admin.id
    )

    db.add(wallet)
    db.commit()

    db.close()