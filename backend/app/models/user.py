from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    full_name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        nullable=False,
        index=True
    )
    # admin | auditor | farmer | ngo | company

    is_verified = Column(
        Boolean,
        default=False
    )

    is_active = Column(
        Boolean,
        default=True
    )

    kyc_completed = Column(
        Boolean,
        default=False
    )

    phone = Column(
        String,
        nullable=True
    )

    country = Column(
        String,
        nullable=True
    )

    organization_name = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    wallet_address = Column(
        String,
        nullable=True,
        unique=True
    )

    wallet_verified = Column(
        Boolean,
        default=False
    )

    wallet_type = Column(
        String,
        nullable=True
    )

    wallet_nonce = Column(
        String,
        nullable=True
    )