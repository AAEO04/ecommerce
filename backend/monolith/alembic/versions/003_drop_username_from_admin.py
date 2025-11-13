"""Drop username from admin_users and make email non-nullable

Revision ID: 003
Revises: 002
Create Date: 2024-11-06 08:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table('admin_users', schema=None) as batch_op:
        batch_op.drop_index('ix_admin_users_username')
        batch_op.drop_column('username')
        batch_op.alter_column('email',
               existing_type=sa.VARCHAR(length=255),
               nullable=False)


def downgrade() -> None:
    with op.batch_alter_table('admin_users', schema=None) as batch_op:
        batch_op.alter_column('email',
               existing_type=sa.VARCHAR(length=255),
               nullable=True)
        batch_op.add_column(sa.Column('username', sa.VARCHAR(length=100), autoincrement=False, nullable=False))
        batch_op.create_index('ix_admin_users_username', ['username'], unique=True)
