# 🔄 Alembic Migration Guide

## What is Alembic?

Alembic is a database migration tool for SQLAlchemy. It allows you to:
- Track database schema changes over time
- Apply changes incrementally
- Rollback changes if needed
- Keep database schema in sync with your models

---

## ✅ Configuration Status

Your Alembic is now properly configured:

- ✅ `alembic.ini` - Fixed paths and database URL
- ✅ `alembic/env.py` - Loads DATABASE_URL from .env file
- ✅ `alembic/versions/` - Contains migration files
  - `001_initial_migration.py` - Base tables
  - `002_add_admin_and_payment_tables.py` - Admin and payment tables

---

## 🚀 Quick Start

### Test Alembic Configuration
```powershell
cd c:\Users\allio\Desktop\madrush\backend\monolith
.\venv\Scripts\Activate.ps1
python test_alembic.py
```

### Check Current Migration Status
```powershell
alembic current
```

### View Migration History
```powershell
alembic history --verbose
```

### Apply All Migrations
```powershell
alembic upgrade head
```

---

## 📋 Common Commands

### Check Status
```powershell
# Show current database revision
alembic current

# Show all migrations
alembic history

# Show pending migrations
alembic heads
```

### Apply Migrations
```powershell
# Apply all pending migrations
alembic upgrade head

# Apply one migration forward
alembic upgrade +1

# Apply to specific revision
alembic upgrade <revision_id>
```

### Rollback Migrations
```powershell
# Rollback one migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade <revision_id>

# Rollback all migrations
alembic downgrade base
```

### Create New Migrations
```powershell
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Add new column to users"

# Create empty migration (manual)
alembic revision -m "Custom migration"
```

---

## 🔧 Current Setup

### Migration Files

**`001_initial_migration.py`**
- Creates: categories, products, productvariants, productimages
- Creates: customers, orders, orderitems
- Status: Base migration

**`002_add_admin_and_payment_tables.py`**
- Creates: admin_users (with email column!)
- Creates: admin_invites, password_resets
- Creates: payments table
- Updates: orders table (adds customer_id, idempotency_key)
- Status: Fixes the missing admin_users.email issue

### Configuration Files

**`alembic.ini`**
```ini
[alembic]
script_location = alembic
prepend_sys_path = .
sqlalchemy.url = driver://user:pass@localhost/dbname  # Overridden by env.py
```

**`alembic/env.py`**
- Loads DATABASE_URL from .env file
- Imports models from database.py
- Configures target_metadata = Base.metadata

---

## 🐛 Troubleshooting

### Issue: "Can't locate revision identified by 'xxx'"
**Solution:**
```powershell
# Check alembic_version table
python -c "from database import engine; from sqlalchemy import text; conn = engine.connect(); result = conn.execute(text('SELECT * FROM alembic_version')); print(list(result))"

# If table doesn't exist or is wrong, stamp the database
alembic stamp head
```

### Issue: "Target database is not up to date"
**Solution:**
```powershell
alembic upgrade head
```

### Issue: "FAILED: Multiple head revisions are present"
**Solution:**
```powershell
# Merge the heads
alembic merge heads -m "merge heads"
```

### Issue: "Table already exists"
**Solution:**
```powershell
# If you manually created tables, stamp the database
alembic stamp head

# Or drop all tables and start fresh
python reset_database.py
alembic upgrade head
```

---

## 🔄 Migration Workflow

### When You Change Models

1. **Modify your models** in `models.py`
   ```python
   # Example: Add a new column
   class Product(Base):
       __tablename__ = "products"
       # ... existing columns ...
       featured = Column(Boolean, default=False)  # New column
   ```

2. **Generate migration**
   ```powershell
   alembic revision --autogenerate -m "Add featured column to products"
   ```

3. **Review the generated migration**
   - Check `alembic/versions/xxx_add_featured_column_to_products.py`
   - Verify the upgrade() and downgrade() functions

4. **Apply the migration**
   ```powershell
   alembic upgrade head
   ```

5. **Test the changes**
   ```powershell
   python test_alembic.py
   ```

---

## 🎯 Best Practices

### DO ✅
- Always review auto-generated migrations before applying
- Test migrations in development before production
- Keep migrations small and focused
- Write descriptive migration messages
- Include both upgrade() and downgrade() functions

### DON'T ❌
- Don't edit applied migrations
- Don't delete migration files
- Don't manually modify the alembic_version table
- Don't skip migrations (always apply in order)
- Don't use `Base.metadata.create_all()` after initial setup

---

## 🚨 Emergency: Reset Everything

If migrations are completely broken:

```powershell
# 1. Backup your data first!

# 2. Drop all tables
python reset_database.py

# 3. Remove alembic_version table
python -c "from database import engine; from sqlalchemy import text; engine.execute(text('DROP TABLE IF EXISTS alembic_version'))"

# 4. Apply all migrations fresh
alembic upgrade head

# 5. Seed database
python seed.py
```

---

## 📚 Additional Resources

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [Auto-generating Migrations](https://alembic.sqlalchemy.org/en/latest/autogenerate.html)

---

## ✅ Verification Checklist

Run these to verify everything is working:

```powershell
# 1. Test Alembic config
python test_alembic.py

# 2. Check current revision
alembic current

# 3. View history
alembic history

# 4. Verify database tables
python -c "from database import engine; from sqlalchemy import inspect; print(inspect(engine).get_table_names())"
```

---

**Your Alembic is now properly configured! 🎉**
