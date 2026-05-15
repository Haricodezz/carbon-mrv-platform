from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
import secrets

from app.db.session import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.core.dependencies import get_current_user

from app.schemas.wallet import (
    WalletConnectRequest,
    WalletVerifyRequest,
    WalletNonceResponse
)

from eth_account.messages import encode_defunct
from web3 import Web3


router = APIRouter(
    prefix="/api/wallet",
    tags=["Wallet"]
)

VERIFICATION_MESSAGE_PREFIX = "Verify your Carbon MRV wallet ownership. Nonce:"


def normalize_address(address: str) -> str:
    return address.strip().lower()


def sync_crypto_wallet(
    db: Session,
    user: User,
    wallet_address: str,
    wallet_type: str | None = None,
) -> None:
    wallet = db.query(Wallet).filter(Wallet.user_id == user.id).first()

    if not wallet:
        return

    wallet.crypto_wallet_address = wallet_address
    if wallet_type:
        wallet.crypto_network = wallet_type


@router.post("/connect")
def connect_wallet(
    request: WalletConnectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    normalized_address = normalize_address(request.wallet_address)

    existing_wallet = db.query(User).filter(
        func.lower(User.wallet_address) == normalized_address
    ).first()

    if existing_wallet and existing_wallet.id != current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Wallet already linked to another account."
        )

    current_user.wallet_address = normalized_address
    current_user.wallet_type = request.wallet_type
    current_user.wallet_verified = False

    sync_crypto_wallet(
        db,
        current_user,
        normalized_address,
        request.wallet_type,
    )

    db.commit()

    return {
        "message": "Wallet connected successfully. Verification pending.",
        "wallet_address": current_user.wallet_address,
        "wallet_type": current_user.wallet_type,
        "wallet_verified": current_user.wallet_verified
    }


@router.get("/me")
def get_wallet_info(
    current_user: User = Depends(get_current_user)
):
    return {
        "wallet_address": current_user.wallet_address,
        "wallet_type": current_user.wallet_type,
        "wallet_verified": current_user.wallet_verified
    }


@router.get("/nonce", response_model=WalletNonceResponse)
def generate_wallet_nonce(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.wallet_address:
        raise HTTPException(
            status_code=400,
            detail="Connect a wallet before requesting a verification nonce."
        )

    nonce = secrets.token_hex(16)

    current_user.wallet_nonce = nonce
    db.commit()

    return {
        "nonce": nonce
    }


@router.post("/verify")
def verify_wallet(
    request: WalletVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    normalized_request_address = normalize_address(request.wallet_address)

    if (
        not current_user.wallet_address
        or current_user.wallet_address != normalized_request_address
    ):
        raise HTTPException(
            status_code=400,
            detail="Wallet address mismatch."
        )

    if not current_user.wallet_nonce:
        raise HTTPException(
            status_code=400,
            detail="No active wallet verification nonce."
        )

    expected_message = (
        f"{VERIFICATION_MESSAGE_PREFIX} {current_user.wallet_nonce}"
    )

    if request.message != expected_message:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification message."
        )

    try:
        encoded_message = encode_defunct(text=request.message)

        recovered_address = Web3().eth.account.recover_message(
            encoded_message,
            signature=request.signature
        )

        if recovered_address.lower() != normalized_request_address:
            raise HTTPException(
                status_code=400,
                detail="Signature verification failed."
            )

        current_user.wallet_verified = True
        current_user.wallet_nonce = None
        current_user.wallet_type = request.wallet_type

        sync_crypto_wallet(
            db,
            current_user,
            normalized_request_address,
            request.wallet_type,
        )

        db.commit()

        return {
            "message": "Wallet verified successfully.",
            "wallet_address": current_user.wallet_address,
            "wallet_verified": current_user.wallet_verified
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid wallet signature."
        )
