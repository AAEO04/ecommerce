-- Grant all permissions on pending_checkouts table to madrush_user
GRANT ALL PRIVILEGES ON TABLE pending_checkouts TO madrush_user;

-- Grant permissions on the sequence (for auto-increment ID)
GRANT USAGE, SELECT ON SEQUENCE pending_checkouts_id_seq TO madrush_user;

-- Verify permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='pending_checkouts';
