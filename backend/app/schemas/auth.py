from pydantic import BaseModel, EmailStr , Field


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=64)
    role: str
    phone: str | None = None
    country: str | None = None
    organization_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"