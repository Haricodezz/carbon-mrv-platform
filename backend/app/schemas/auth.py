from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


PUBLIC_REGISTRATION_ROLES = ("farmer", "ngo", "company")
PRIVILEGED_ROLES = ("admin", "auditor")
ALL_ROLES = (*PRIVILEGED_ROLES, *PUBLIC_REGISTRATION_ROLES)

PublicRegistrationRole = Literal["farmer", "ngo", "company"]
UserRole = Literal["admin", "auditor", "farmer", "ngo", "company"]


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=64)
    role: PublicRegistrationRole
    phone: str | None = Field(default=None, max_length=30)
    country: str | None = Field(default=None, max_length=100)
    organization_name: str | None = Field(default=None, max_length=150)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, value: str) -> str:
        return str(value).strip().lower()

    @field_validator("full_name", "phone", "country", "organization_name")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    email: EmailStr
    role: UserRole
    phone: str | None = None
    country: str | None = None
    organization_name: str | None = None
    is_verified: bool
    is_active: bool
    kyc_completed: bool
    wallet_address: str | None = None
    wallet_type: str | None = None
    wallet_verified: bool
    created_at: datetime | None = None
