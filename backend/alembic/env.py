from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

from app.core.config import settings
from app.db.session import Base

# Import all models to ensure they are registered on Base.metadata for Alembic
from app.models.user import User
from app.models.project import Project
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.purchase import Purchase
from app.models.payment import Payment
from app.models.order import Order
from app.models.certificate import Certificate
from app.models.escrow import EscrowTransaction
from app.models.credit_ownership import CreditOwnership
from app.models.audit_log import AuditLog
from app.models.blog_post import BlogPost
from app.models.notification import Notification
from app.models.kyc_verification import KYCVerification
from app.models.land_verification import LandVerification


# =========================
# ALEMBIC CONFIG
# =========================
config = context.config

# Dynamic DB URL from .env
config.set_main_option(
    "sqlalchemy.url",
    settings.DATABASE_URL.replace("%", "%%"),
)

# Logging
if config.config_file_name is not None:
    fileConfig(
        config.config_file_name
    )

# Metadata
target_metadata = Base.metadata


# =========================
# OFFLINE MIGRATIONS
# =========================
def run_migrations_offline() -> None:
    url = config.get_main_option(
        "sqlalchemy.url"
    )

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        dialect_opts={
            "paramstyle": "named"
        },
    )

    with context.begin_transaction():
        context.run_migrations()


# =========================
# ONLINE MIGRATIONS
# =========================
def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(
            config.config_ini_section,
            {},
        ),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# =========================
# EXECUTION MODE
# =========================
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
