"""
Quick script to fix database schema issues
Run this to drop all tables and recreate them with proper schema
"""
import sys
from sqlalchemy import text
from database import engine, SessionLocal
from models import Base
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def drop_all_tables():
    """Drop all tables in the database"""
    logger.info("🗑️  Dropping all tables...")
    
    with engine.connect() as conn:
        # Drop all tables
        conn.execute(text("DROP SCHEMA public CASCADE"))
        conn.execute(text("CREATE SCHEMA public"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO postgres"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO public"))
        conn.commit()
    
    logger.info("✅ All tables dropped")

def create_all_tables():
    """Create all tables from models"""
    logger.info("📦 Creating all tables from models...")
    Base.metadata.create_all(bind=engine)
    logger.info("✅ All tables created")

def main():
    try:
        logger.info("🔧 Starting database fix...")
        logger.info("")
        logger.info("⚠️  WARNING: This will DELETE ALL DATA in the database!")
        logger.info("")
        
        response = input("Are you sure you want to continue? (yes/no): ")
        if response.lower() != 'yes':
            logger.info("❌ Operation cancelled")
            return
        
        drop_all_tables()
        create_all_tables()
        
        logger.info("")
        logger.info("✅ Database fixed successfully!")
        logger.info("📝 You can now run seed.py to populate initial data")
        
    except Exception as e:
        logger.error(f"❌ Error fixing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
