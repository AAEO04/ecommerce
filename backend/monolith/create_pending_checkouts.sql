-- Create pending_checkouts table for Paystack payment integration
CREATE TABLE IF NOT EXISTS pending_checkouts (
    id INT NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    payment_reference VARCHAR(100) NOT NULL UNIQUE,
    checkout_data TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Add table and column comments for documentation
COMMENT ON TABLE pending_checkouts IS 'Stores pending checkout data before payment confirmation via Paystack webhook';
COMMENT ON COLUMN pending_checkouts.id IS 'Primary key, auto-incrementing';
COMMENT ON COLUMN pending_checkouts.idempotency_key IS 'Unique key to prevent duplicate checkout submissions';
COMMENT ON COLUMN pending_checkouts.payment_reference IS 'Paystack payment reference for tracking';
COMMENT ON COLUMN pending_checkouts.checkout_data IS 'JSON string containing cart items, customer details, and payment info';
COMMENT ON COLUMN pending_checkouts.status IS 'Status: pending, completed, expired, or failed';
COMMENT ON COLUMN pending_checkouts.created_at IS 'Timestamp when checkout was initiated';
COMMENT ON COLUMN pending_checkouts.expires_at IS 'When this pending checkout expires (typically 1 hour after creation)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS ix_pending_checkouts_id ON pending_checkouts(id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_pending_checkouts_idempotency_key ON pending_checkouts(idempotency_key);
CREATE UNIQUE INDEX IF NOT EXISTS ix_pending_checkouts_payment_reference ON pending_checkouts(payment_reference);
CREATE INDEX IF NOT EXISTS ix_pending_checkouts_status ON pending_checkouts(status);
CREATE INDEX IF NOT EXISTS ix_pending_checkouts_expires_at ON pending_checkouts(expires_at);
