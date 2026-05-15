from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.session import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    owner_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    project_name = Column(
        String,
        nullable=False
    )

    project_type = Column(
        String,
        nullable=False
    )
    # farmer | ngo
   
    
    location = Column(
        String,
        nullable=False
    )
    country = Column(String, nullable=False)
    land_area_acres = Column(
        Float,
        nullable=False
    )

 


    satellite_status = Column(
        String,
        default="pending"
    )
    # pending | verified | rejected

    audit_status = Column(
        String,
        default="pending"
    )
    # pending | approved | rejected

    estimated_annual_credits = Column(
        Float,
        default=0.0
    )

    first_issuance_credits = Column(
        Float,
        default=0.0
    )

    total_credits_generated = Column(
        Float,
        default=0.0
    )

    status = Column(
        String,
        default="draft"
    )
    # draft | active | marketplace | retired

    description = Column(
        Text,
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