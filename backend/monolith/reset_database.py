"""
Database Reset Script for Development
Safely drops and recreates all tables with correct schema
"""
import sys
import logging
from sqlalchemy import text, inspect
from database import engine
from models import Base

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

def drop_all_tables():
    """Drop all tables safely"""
    logger.info("🗑️  Dropping all tables...")
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    if not tables:
        logger.info("ℹ️  No tables found to drop")
        return True
    
    logger.info(f"📋 Found {len(tables)} tables to drop")
    
    try:
        with engine.connect() as conn:
            # Disable foreign key checks temporarily
            conn.execute(text("SET session_replication_role = 'replica';"))
            conn.commit()
            
            # Drop each table
            for table in tables:
                try:
                    logger.info(f"  Dropping: {table}")
                    conn.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE'))
                    conn.commit()
                except Exception as e:
                    logger.warning(f"  ⚠️  Could not drop {table}: {e}")
            
            # Re-enable foreign key checks
            conn.execute(text("SET session_replication_role = 'origin';"))
            conn.commit()
        
        logger.info("✅ All tables dropped successfully\n")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error dropping tables: {e}")
        return False

def create_all_tables():
    """Create all tables from models"""
    logger.info("📦 Creating all tables from models...")
    
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ All tables created successfully\n")
        return True
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")
        return False

def verify_schema():
    """Verify all tables and columns exist"""
    logger.info("🔍 Verifying database schema...")
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    expected_tables = {
        'categories': ['id', 'name', 'slug', 'description', 'parent_id', 'is_active', 'created_at'],
        'products': ['id', 'name', 'description', 'category', 'is_active', 'created_at', 'updated_at'],
        'productvariants': ['id', 'size', 'color', 'stock_quantity', 'price', 'sku', 'is_active', 'created_at', 'product_id'],
        'productimages': ['id', 'image_url', 'alt_text', 'display_order', 'is_primary', 'created_at', 'product_id'],
        'customers': ['id', 'email', 'phone', 'first_name', 'last_name', 'date_of_birth', 'is_active', 'created_at', 'updated_at'],
        'orders': ['id', 'order_number', 'idempotency_key', 'status', 'payment_status', 'payment_method', 'payment_reference', 'customer_id', 'shipping_address', 'billing_address', 'total_amount', 'shipping_cost', 'tax_amount', 'notes', 'created_at', 'updated_at'],
        'orderitems': ['id', 'quantity', 'unit_price', 'total_price', 'order_id', 'variant_id'],
        'admin_users': ['id', 'email', 'hashed_password', 'role', 'is_active', 'created_at', 'updated_at'],
        'admin_invites': ['id', 'email', 'token_hash', 'role', 'invited_by', 'is_used', 'expires_at', 'created_at', 'used_at'],
        'password_resets': ['id', 'email', 'token_hash', 'is_used', 'expires_at', 'created_at', 'used_at'],
        'payments': ['id', 'order_id', 'reference', 'amount', 'status', 'payment_method', 'channel', 'fees', 'payment_metadata', 'paid_at', 'created_at', 'updated_at'],
    }
    
    all_ok = True
    
    for table_name, expected_columns in expected_tables.items():
        if table_name not in tables:
            logger.error(f"  ❌ Table missing: {table_name}")
            all_ok = False
            continue
        
        actual_columns = [col['name'] for col in inspector.get_columns(table_name)]
        missing_columns = set(expected_columns) - set(actual_columns)
        
        if missing_columns:
            logger.error(f"  ❌ {table_name}: Missing columns: {', '.join(missing_columns)}")
            all_ok = False
        else:
            logger.info(f"  ✅ {table_name}: All columns present")
    
    if all_ok:
        logger.info("\n✅ Schema verification passed!\n")
    else:
        logger.error("\n❌ Schema verification failed!\n")
    
    return all_ok

def main():
    logger.info("=" * 70)
    logger.info("🔄 DATABASE RESET FOR DEVELOPMENT")
    logger.info("=" * 70)
    logger.info("")
    logger.info("⚠️  WARNING: This will DELETE ALL DATA in the database!")
    logger.info("")
    
    # Confirmation
    response = input("Are you sure you want to continue? (yes/no): ")
    if response.lower() != 'yes':
        logger.info("❌ Operation cancelled")
        return
    
    logger.info("")
    
    try:
        # Step 1: Drop all tables
        if not drop_all_tables():
            logger.error("❌ Failed to drop tables")
            sys.exit(1)
        
        # Step 2: Create all tables
        if not create_all_tables():
            logger.error("❌ Failed to create tables")
            sys.exit(1)
        
        # Step 3: Verify schema
        if not verify_schema():
            logger.error("❌ Schema verification failed")
            sys.exit(1)
        
        # Success
        logger.info("=" * 70)
        logger.info("✅ DATABASE RESET COMPLETE!")
        logger.info("=" * 70)
        logger.info("")
        logger.info("Next steps:")
        logger.info("  1. Run: python seed.py")
        logger.info("  2. Start the backend: uvicorn main:app --reload")
        logger.info("")
        
    except Exception as e:
        logger.error(f"❌ Error during database reset: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
