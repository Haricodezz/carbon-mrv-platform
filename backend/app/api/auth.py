from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.auth import RegisterRequest, TokenResponse
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


VALID_ROLES = ["farmer", "ngo", "company"]


@router.post("/register", response_model=TokenResponse)
def register_user(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    # Prevent unauthorized roles
    if request.role.lower() not in VALID_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Invalid registration role."
        )

    # Existing user check
    existing_user = db.query(User).filter(
        User.email == request.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    # Create user
    new_user = User(
        full_name=request.full_name,
        email=request.email,
        password_hash=hash_password(request.password),
        role=request.role.lower(),
        phone=request.phone,
        country=request.country,
        organization_name=request.organization_name
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create wallet
    wallet = Wallet(
        user_id=new_user.id
    )

    db.add(wallet)
    db.commit()

    # JWT
    token = create_access_token({
        "sub": str(new_user.id),
        "role": new_user.role
    })

    return TokenResponse(
        access_token=token
    )


@router.post("/login", response_model=TokenResponse)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials."
        )

    if not verify_password(
        form_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials."
        )

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })

    return TokenResponse(
        access_token=token
    )


@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "country": current_user.country,
        "organization_name": current_user.organization_name,
        "is_verified": current_user.is_verified,
        "wallet_address": current_user.wallet_address,
        "wallet_type": current_user.wallet_type,
        "wallet_verified": current_user.wallet_verified,
        "created_at": current_user.created_at
    }