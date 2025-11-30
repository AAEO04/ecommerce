"""add_webhook_events_table

Revision ID: 6bebf275f794
Revises: 003
Create Date: 2025-11-20 19:58:08.961406

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6bebf275f794'
down_revision = '003'
branch_labels = None
depends_on = None




def upgrade() -> None:
    # Create webhook_events table
    op.create_table(
        'webhook_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('event_id', sa.String(length=255), nullable=False),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('payment_reference', sa.String(length=255), nullable=True),
        sa.Column('status', sa.String(length=50), server_default='processed', nullable=True),
        sa.Column('raw_data', sa.Text(), nullable=False),
        sa.Column('processed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_webhook_events_id'), 'webhook_events', ['id'], unique=False)
    op.create_index(op.f('ix_webhook_events_event_id'), 'webhook_events', ['event_id'], unique=True)
    op.create_index(op.f('ix_webhook_events_payment_reference'), 'webhook_events', ['payment_reference'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_webhook_events_payment_reference'), table_name='webhook_events')
    op.drop_index(op.f('ix_webhook_events_event_id'), table_name='webhook_events')
    op.drop_index(op.f('ix_webhook_events_id'), table_name='webhook_events')
    
    # Drop table
    op.drop_table('webhook_events')
