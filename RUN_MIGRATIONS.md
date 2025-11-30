
# Run Database Migrations

This script runs all pending Alembic migrations for the payment security fixes.

## What will be migrated:

1. **webhook_events table** - For replay attack protection and audit trail
2. **Performance indexes** - For orders and pending_checkouts tables

## How to run:

```bash
cd C:\Users\allio\Desktop\madrush
run_migration.bat
```

Or manually:

```bash
cd backend\monolith
alembic upgrade head
```

## Verify migrations:

After running, verify in PostgreSQL:

```sql
-- Check webhook_events table exists
SELECT * FROM webhook_events LIMIT 1;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename IN ('webhook_events', 'orders', 'pending_checkouts');
```

## Grant permissions (if needed):

If you get permission errors, run:

```bash
cd backend\monolith
psql -U postgres -d your_database -f grant_permissions.sql
```
