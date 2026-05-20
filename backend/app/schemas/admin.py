from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

# Dashbord Metrics
class DashboardMetrics(BaseModel):
    total_users: int
    total_projects: int
    verified_projects: int
    pending_verifications: int
    total_credits_sold: float
    total_revenue_inr: float
    active_companies: int
    active_farmers: int
    active_ngos: int
    active_auditors: int
    rejected_projects: int
    total_carbon_stock: float
    marketplace_volume: float
    satellite_verified: int
    avg_ndvi: float
    avg_agb: float
    fraud_alerts: int

# User Management
class UserAdminResponse(BaseModel):
    id: UUID
    full_name: str
    email: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime

# Audit Logging
class AuditLogResponse(BaseModel):
    id: UUID
    actor_id: UUID | None
    target_id: UUID | None
    action_type: str
    target_type: str
    notes: str | None
    risk_score: float
    created_at: datetime

# Fraud Reports
class FraudReportResponse(BaseModel):
    project_id: UUID
    project_name: str
    fraud_risk_score: float
    status: str
    verification_notes: str | None

# Verification Action
class ProjectVerificationRequest(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected|verified)$")
    notes: str | None = None
    risk_score: float | None = 0.0

class UserModerationRequest(BaseModel):
    is_active: bool
    notes: str | None = None
