"""add_payment_indexes_and_optimizations

Revision ID: 1b8e80f66db3
Revises: 6bebf275f794
Create Date: 2025-11-20 20:13:42.718288

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1b8e80f66db3'
down_revision = '6bebf275f794'
branch_labels = None
depends_on = None




def upgrade() -> None:
    # Add indexes to orders table for better query performance
    op.create_index(
        'ix_orders_payment_reference', 
        'orders', 
        ['payment_reference'], 
        unique=False
    )
    
    # Add composite index for pending_checkouts cleanup queries
    op.create_index(
        'ix_pending_checkouts_status_expires', 
        'pending_checkouts', 
        ['status', 'expires_at'], 
        unique=False
    )


def downgrade() -> None:
    # Drop indexes in reverse order
    op.drop_index('ix_pending_checkouts_status_expires', table_name='pending_checkouts')
    op.drop_index('ix_orders_payment_reference', table_name='orders')
