"""Add admin and payment tables

Revision ID: 002
Revises: 001
Create Date: 2024-11-06 07:20:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create admin_users table
    op.create_table('admin_users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=100), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=True),
    sa.Column('hashed_password', sa.String(length=255), nullable=False),
    sa.Column('role', sa.String(length=50), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_admin_users_id'), 'admin_users', ['id'], unique=False)
    op.create_index(op.f('ix_admin_users_username'), 'admin_users', ['username'], unique=True)
    op.create_index(op.f('ix_admin_users_email'), 'admin_users', ['email'], unique=True)

    # Create admin_invites table
    op.create_table('admin_invites',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('token_hash', sa.String(length=255), nullable=False),
    sa.Column('role', sa.String(length=50), nullable=False),
    sa.Column('invited_by', sa.Integer(), nullable=False),
    sa.Column('is_used', sa.Boolean(), nullable=True),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['invited_by'], ['admin_users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_admin_invites_id'), 'admin_invites', ['id'], unique=False)
    op.create_index(op.f('ix_admin_invites_email'), 'admin_invites', ['email'], unique=False)

    # Create password_resets table
    op.create_table('password_resets',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('token_hash', sa.String(length=255), nullable=False),
    sa.Column('is_used', sa.Boolean(), nullable=True),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_password_resets_id'), 'password_resets', ['id'], unique=False)
    op.create_index(op.f('ix_password_resets_email'), 'password_resets', ['email'], unique=False)

    # Update orders table to match current model
    # Add missing columns
    op.add_column('orders', sa.Column('idempotency_key', sa.String(length=100), nullable=True))
    op.add_column('orders', sa.Column('customer_id', sa.Integer(), nullable=True))
    
    # Create index for idempotency_key
    op.create_index(op.f('ix_orders_idempotency_key'), 'orders', ['idempotency_key'], unique=True)
    
    # Add foreign key constraint for customer_id
    op.create_foreign_key('fk_orders_customer_id', 'orders', 'customers', ['customer_id'], ['id'])
    
    # Drop old customer columns (we'll keep them for now to avoid data loss)
    # In production, you'd migrate data first, then drop these columns
    # op.drop_column('orders', 'customer_name')
    # op.drop_column('orders', 'customer_email')
    # op.drop_column('orders', 'customer_phone')

    # Create payments table
    op.create_table('payments',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('order_id', sa.Integer(), nullable=False),
    sa.Column('reference', sa.String(length=100), nullable=False),
    sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('status', sa.String(length=50), nullable=True),
    sa.Column('payment_method', sa.String(length=50), nullable=True),
    sa.Column('channel', sa.String(length=50), nullable=True),
    sa.Column('fees', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('payment_metadata', sa.Text(), nullable=True),
    sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_payments_id'), 'payments', ['id'], unique=False)
    op.create_index(op.f('ix_payments_order_id'), 'payments', ['order_id'], unique=False)
    op.create_index(op.f('ix_payments_reference'), 'payments', ['reference'], unique=True)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('payments')
    op.drop_constraint('fk_orders_customer_id', 'orders', type_='foreignkey')
    op.drop_index(op.f('ix_orders_idempotency_key'), table_name='orders')
    op.drop_column('orders', 'customer_id')
    op.drop_column('orders', 'idempotency_key')
    op.drop_table('password_resets')
    op.drop_table('admin_invites')
    op.drop_table('admin_users')
