from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.wallet import Wallet
from app.models.credit_ownership import CreditOwnership
from app.models.transaction import Transaction
from app.models.project import Project

class WalletService:
    @staticmethod
    def get_or_create_wallet(db: Session, user_id: UUID) -> Wallet:
        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
        if not wallet:
            wallet = Wallet(user_id=user_id)
            db.add(wallet)
            db.commit()
            db.refresh(wallet)
        return wallet

    @staticmethod
    def verify_wallet_address(db: Session, user_id: UUID, address: str) -> Wallet:
        from app.models.user import User
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.role == "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin wallets cannot behave like normal user wallets. Use the master system wallet."
            )
            
        wallet = WalletService.get_or_create_wallet(db, user_id)
        wallet.wallet_address = address
        wallet.is_verified = True
        
        # Sync to User model
        if user:
            user.wallet_address = address
            user.wallet_verified = True
            
        db.commit()
        db.refresh(wallet)
        return wallet

    @staticmethod
    def update_balances_from_purchase(db: Session, user_id: UUID, credit_amount: float):
        wallet = WalletService.get_or_create_wallet(db, user_id)
        wallet.carbon_balance += credit_amount
        wallet.total_purchased += credit_amount
        db.commit()

    @staticmethod
    def get_user_portfolio(db: Session, user_id: UUID):
        return db.query(CreditOwnership, Project).join(
            Project, CreditOwnership.project_id == Project.id
        ).filter(CreditOwnership.owner_id == user_id).all()

    @staticmethod
    def retire_credits(db: Session, user_id: UUID, project_id: UUID, amount: float, tx_hash: str = None):
        ownership = db.query(CreditOwnership).filter(
            CreditOwnership.owner_id == user_id,
            CreditOwnership.project_id == project_id
        ).with_for_update().first()

        if not ownership or ownership.total_credits_owned < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient credits in specific project portfolio."
            )

        wallet = WalletService.get_or_create_wallet(db, user_id)
        if wallet.carbon_balance < amount:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient overall carbon balance."
            )

        # Update Ownership
        ownership.total_credits_owned -= amount
        ownership.credits_retired += amount

        # Update Wallet
        wallet.carbon_balance -= amount
        wallet.total_retired += amount

        # Log Transaction
        transaction = Transaction(
            buyer_id=user_id,
            project_id=project_id,
            transaction_type="credit_retirement",
            amount=0, # Retirement has no fiat value usually
            credits=amount,
            blockchain_tx_hash=tx_hash,
            status="completed"
        )
        db.add(transaction)
        
        db.commit()
        return ownership

wallet_service = WalletService()
