from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.auth import (
    AuthUserResponse,
    LoginRequest,
    PUBLIC_REGISTRATION_ROLES,
    RegisterRequest,
    TokenResponse,
)
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


def _create_user_token(user: User) -> TokenResponse:
    token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })

    return TokenResponse(access_token=token)


@router.post("/register", response_model=TokenResponse)
def register_user(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    if request.role not in PUBLIC_REGISTRATION_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid registration role."
        )

    existing_user = db.query(User).filter(
        User.email == request.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    new_user = User(
        full_name=request.full_name,
        email=request.email,
        password_hash=hash_password(request.password),
        role=request.role,
        phone=request.phone,
        country=request.country,
        organization_name=request.organization_name
    )

    try:
        db.add(new_user)
        db.flush()

        db.add(Wallet(user_id=new_user.id))
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    return _create_user_token(new_user)


def _authenticate_user(
    email: str,
    password: str,
    db: Session
) -> User:
    user = db.query(User).filter(
        User.email == str(email).strip().lower()
    ).first()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive."
        )

    return user


@router.post("/login", response_model=TokenResponse)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = _authenticate_user(
        email=form_data.username,
        password=form_data.password,
        db=db,
    )

    return _create_user_token(user)


@router.post("/login/json", response_model=TokenResponse)
def login_user_json(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    user = _authenticate_user(
        email=request.email,
        password=request.password,
        db=db,
    )

    return _create_user_token(user)


@router.get("/me", response_model=AuthUserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user
