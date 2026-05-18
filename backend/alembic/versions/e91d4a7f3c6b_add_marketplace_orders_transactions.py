"""Add marketplace orders and transactions

Revision ID: e91d4a7f3c6b
Revises: d575a320f809
Create Date: 2026-05-19 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e91d4a7f3c6b"
down_revision: Union[str, Sequence[str], None] = "d575a320f809"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "projects",
        sa.Column("credits_available", sa.Float(), server_default="0", nullable=False),
    )
    op.add_column(
        "projects",
        sa.Column("credits_sold", sa.Float(), server_default="0", nullable=False),
    )
    op.add_column(
        "projects",
        sa.Column("price_per_credit", sa.Float(), server_default="1000", nullable=False),
    )
    op.add_column(
        "projects",
        sa.Column("credit_currency", sa.String(), server_default="INR", nullable=False),
    )

    op.execute(
        """
        UPDATE projects
        SET credits_available = GREATEST(COALESCE(total_credits_generated, estimated_credits, 0), 0)
        WHERE credits_available = 0
        """
    )

    op.create_table(
        "orders",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("buyer_id", sa.UUID(), nullable=False),
        sa.Column("seller_id", sa.UUID(), nullable=False),
        sa.Column("project_id", sa.UUID(), nullable=False),
        sa.Column("credits_ordered", sa.Float(), nullable=False),
        sa.Column("price_per_credit", sa.Float(), nullable=False),
        sa.Column("subtotal", sa.Float(), nullable=False),
        sa.Column("platform_fee", sa.Float(), server_default="0", nullable=False),
        sa.Column("total_amount", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(), server_default="INR", nullable=False),
        sa.Column("status", sa.String(), server_default="completed", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["buyer_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["seller_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_orders_id"), "orders", ["id"], unique=False)
    op.create_index(op.f("ix_orders_buyer_id"), "orders", ["buyer_id"], unique=False)
    op.create_index(op.f("ix_orders_seller_id"), "orders", ["seller_id"], unique=False)
    op.create_index(op.f("ix_orders_project_id"), "orders", ["project_id"], unique=False)

    op.create_table(
        "transactions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("order_id", sa.UUID(), nullable=False),
        sa.Column("buyer_id", sa.UUID(), nullable=False),
        sa.Column("project_id", sa.UUID(), nullable=False),
        sa.Column("transaction_type", sa.String(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("credits", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(), server_default="INR", nullable=False),
        sa.Column("blockchain_tx_hash", sa.String(), nullable=True),
        sa.Column("status", sa.String(), server_default="completed", nullable=False),
        sa.Column("transaction_metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["buyer_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_transactions_id"), "transactions", ["id"], unique=False)
    op.create_index(op.f("ix_transactions_order_id"), "transactions", ["order_id"], unique=False)
    op.create_index(op.f("ix_transactions_buyer_id"), "transactions", ["buyer_id"], unique=False)
    op.create_index(op.f("ix_transactions_project_id"), "transactions", ["project_id"], unique=False)

    op.add_column("purchases", sa.Column("order_id", sa.UUID(), nullable=True))
    op.add_column("purchases", sa.Column("transaction_id", sa.UUID(), nullable=True))
    op.add_column(
        "purchases",
        sa.Column("currency", sa.String(), server_default="INR", nullable=False),
    )
    op.create_foreign_key(
        "fk_purchases_order_id_orders",
        "purchases",
        "orders",
        ["order_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_purchases_transaction_id_transactions",
        "purchases",
        "transactions",
        ["transaction_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(op.f("ix_purchases_order_id"), "purchases", ["order_id"], unique=False)
    op.create_index(op.f("ix_purchases_transaction_id"), "purchases", ["transaction_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_purchases_transaction_id"), table_name="purchases")
    op.drop_index(op.f("ix_purchases_order_id"), table_name="purchases")
    op.drop_constraint("fk_purchases_transaction_id_transactions", "purchases", type_="foreignkey")
    op.drop_constraint("fk_purchases_order_id_orders", "purchases", type_="foreignkey")
    op.drop_column("purchases", "currency")
    op.drop_column("purchases", "transaction_id")
    op.drop_column("purchases", "order_id")

    op.drop_index(op.f("ix_transactions_project_id"), table_name="transactions")
    op.drop_index(op.f("ix_transactions_buyer_id"), table_name="transactions")
    op.drop_index(op.f("ix_transactions_order_id"), table_name="transactions")
    op.drop_index(op.f("ix_transactions_id"), table_name="transactions")
    op.drop_table("transactions")

    op.drop_index(op.f("ix_orders_project_id"), table_name="orders")
    op.drop_index(op.f("ix_orders_seller_id"), table_name="orders")
    op.drop_index(op.f("ix_orders_buyer_id"), table_name="orders")
    op.drop_index(op.f("ix_orders_id"), table_name="orders")
    op.drop_table("orders")

    op.drop_column("projects", "credit_currency")
    op.drop_column("projects", "price_per_credit")
    op.drop_column("projects", "credits_sold")
    op.drop_column("projects", "credits_available")
