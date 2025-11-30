"""migrate_checkout_data_to_jsonb

Revision ID: 86867ea0ecef
Revises: 1b8e80f66db3
Create Date: 2025-11-21 06:22:38.557673

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '86867ea0ecef'
down_revision = '1b8e80f66db3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Only migrate checkout_data to JSONB
    op.alter_column('pending_checkouts', 'checkout_data',
               existing_type=sa.TEXT(),
               type_=postgresql.JSONB(astext_type=sa.Text()),
               existing_nullable=False,
               postgresql_using='checkout_data::jsonb')


def downgrade() -> None:
    # Revert checkout_data to TEXT
    op.alter_column('pending_checkouts', 'checkout_data',
               existing_type=postgresql.JSONB(astext_type=sa.Text()),
               type_=sa.TEXT(),
               existing_nullable=False)
