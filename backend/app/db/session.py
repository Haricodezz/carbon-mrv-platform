from sqlalchemy import create_engine
from sqlalchemy.orm import (
    sessionmaker,
    declarative_base,
)

from app.core.config import settings


# SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)


# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# Base model
Base = declarative_base()


# IMPORT ALL MODELS FOR ALEMBIC METADATA
from app.models.user import User
from app.models.project import Project
from app.models.wallet import Wallet
from app.models.payment import Payment
from app.models.certificate import Certificate
from app.models.escrow import EscrowTransaction
from app.models.order import Order
from app.models.purchase import Purchase
from app.models.transaction import Transaction
from app.models.credit_ownership import CreditOwnership
from app.models.audit_log import AuditLog
from app.models.blog_post import BlogPost
from app.models.notification import Notification
from app.models.kyc_verification import KYCVerification
from app.models.land_verification import LandVerification


# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()
