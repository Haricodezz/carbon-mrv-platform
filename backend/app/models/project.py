from sqlalchemy import (
    Column,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text,
    Boolean,
    Integer,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class Project(Base):
    __tablename__ = "projects"

    # =========================
    # CORE IDENTIFIERS
    # =========================

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    owner_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # =========================
    # BASIC PROJECT DETAILS
    # =========================

    project_name = Column(
        String,
        nullable=False,
    )

    project_type = Column(
        String,
        nullable=True,
    )

    location = Column(
        String,
        nullable=False,
    )

    country = Column(
        String,
        nullable=False,
        default="India",
    )

    description = Column(
        Text,
        nullable=True,
    )

    # =========================
    # GEOLOCATION
    # =========================

    latitude = Column(
        Float,
        nullable=True,
    )

    longitude = Column(
        Float,
        nullable=True,
    )

    polygon_coordinates = Column(
        Text,
        nullable=True,
    )

    land_area_acres = Column(
        Float,
        nullable=False,
        default=0.0,
    )

    # =========================
    # SATELLITE / AI VERIFICATION
    # =========================

    satellite_status = Column(
        String,
        default="pending",
    )
    # pending | verified | rejected

    audit_status = Column(
        String,
        default="pending",
    )
    # pending | approved | rejected

    ndvi_score = Column(
        Float,
        default=0.0,
    )

    vegetation_health = Column(
        Float,
        default=0.0,
    )

    fraud_risk_score = Column(
        Float,
        default=0.0,
    )

    verification_notes = Column(
        Text,
        nullable=True,
    )

    # =========================
    # BIOMASS / CARBON ANALYTICS
    # =========================

    agb_per_hectare = Column(
        Float,
        default=0.0,
    )

    total_biomass = Column(
        Float,
        default=0.0,
    )

    carbon_stock = Column(
        Float,
        default=0.0,
    )

    co2e = Column(
        Float,
        default=0.0,
    )

    # =========================
    # CREDIT ESTIMATION
    # =========================

    estimated_annual_credits = Column(
        Float,
        default=0.0,
    )

    first_issuance_credits = Column(
        Float,
        default=0.0,
    )

    estimated_credits = Column(
        Integer,
        default=0,
    )

    total_credits_generated = Column(
        Float,
        default=0.0,
    )

    credits_available = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    credits_sold = Column(
        Float,
        default=0.0,
        nullable=False,
    )

    price_per_credit = Column(
        Float,
        default=1000.0,
        nullable=False,
    )

    credit_currency = Column(
        String,
        default="INR",
        nullable=False,
    )

    # =========================
    # PLATFORM STATUS
    # =========================

    status = Column(
        String,
        default="draft",
    )
    # draft | active | marketplace | retired

    # =========================
    # BLOCKCHAIN
    # =========================

    tokenized = Column(
        Boolean,
        default=False,
    )

    blockchain_tx_hash = Column(
        String,
        nullable=True,
    )

    # =========================
    # TIMESTAMPS
    # =========================

    created_at = Column(
        DateTime(
            timezone=True
        ),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(
            timezone=True
        ),
        server_default=func.now(),
        onupdate=func.now(),
    )
