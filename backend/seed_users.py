"""
seed_users.py — Create test users for development
==================================================
Run from the backend directory:
    .venv\Scripts\python.exe seed_users.py

Creates:
  • Farmer: hari.farmer@example.com / SecurePass123
  • NCO:    gkc.nco@example.com    / SecurePass123
"""

import sys
import os

# Ensure app package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.wallet import Wallet
from app.core.security import hash_password


SEED_USERS = [
    {
        "full_name": "Hari",
        "email": "hari.farmer@example.com",
        "password": "SecurePass123",
        "role": "farmer",
        "phone": "9876543210",
        "country": "Bihar, India",
        "organization_name": None,
    },
    {
        "full_name": "GKC",
        "email": "gkc.nco@example.com",
        "password": "SecurePass123",
        "role": "nco",
        "phone": "9123456780",
        "country": "Jharkhand, India",
        "organization_name": "Green Krishi Collective",
    },
]


def seed():
    db = SessionLocal()
    try:
        for user_data in SEED_USERS:
            existing = db.query(User).filter(
                User.email == user_data["email"]
            ).first()

            if existing:
                print(f"[SKIP]  {user_data['email']} already exists.")
                continue

            user = User(
                full_name=user_data["full_name"],
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                role=user_data["role"],
                phone=user_data["phone"],
                country=user_data["country"],
                organization_name=user_data["organization_name"],
                is_verified=True,
                is_active=True,
                kyc_completed=True,
            )

            db.add(user)
            db.flush()

            wallet = Wallet(user_id=user.id)
            db.add(wallet)

            db.commit()
            db.refresh(user)
            print(f"[OK]    Created {user.role} user: {user.email}")

    finally:
        db.close()


if __name__ == "__main__":
    print("Seeding test users...")
    seed()
    print("Done.")
