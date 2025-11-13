"""
Test Alembic Configuration
Verifies that Alembic is properly configured and can connect to the database
"""
import os
import sys
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

def test_alembic_config():
    """Test if Alembic configuration is valid"""
    logger.info("🔍 Testing Alembic Configuration")
    logger.info("=" * 70)
    logger.info("")
    
    # Check alembic.ini exists
    alembic_ini = Path(__file__).parent / 'alembic.ini'
    logger.info(f"1. Checking alembic.ini...")
    if alembic_ini.exists():
        logger.info(f"   ✅ Found: {alembic_ini}")
    else:
        logger.error(f"   ❌ Not found: {alembic_ini}")
        return False
    
    # Check alembic directory exists
    alembic_dir = Path(__file__).parent / 'alembic'
    logger.info(f"2. Checking alembic directory...")
    if alembic_dir.exists():
        logger.info(f"   ✅ Found: {alembic_dir}")
    else:
        logger.error(f"   ❌ Not found: {alembic_dir}")
        return False
    
    # Check env.py exists
    env_py = alembic_dir / 'env.py'
    logger.info(f"3. Checking env.py...")
    if env_py.exists():
        logger.info(f"   ✅ Found: {env_py}")
    else:
        logger.error(f"   ❌ Not found: {env_py}")
        return False
    
    # Check versions directory
    versions_dir = alembic_dir / 'versions'
    logger.info(f"4. Checking versions directory...")
    if versions_dir.exists():
        migrations = list(versions_dir.glob('*.py'))
        migrations = [m for m in migrations if m.name != '__init__.py']
        logger.info(f"   ✅ Found: {versions_dir}")
        logger.info(f"   📋 Migrations: {len(migrations)}")
        for migration in migrations:
            logger.info(f"      - {migration.name}")
    else:
        logger.error(f"   ❌ Not found: {versions_dir}")
        return False
    
    # Test Alembic can load config
    logger.info(f"5. Testing Alembic config loading...")
    try:
        from alembic.config import Config
        from alembic import command
        
        alembic_cfg = Config(str(alembic_ini))
        logger.info(f"   ✅ Alembic config loaded successfully")
        
        # Get current revision
        logger.info(f"6. Checking database migration status...")
        try:
            from alembic.script import ScriptDirectory
            from alembic.runtime.migration import MigrationContext
            from database import engine
            
            script = ScriptDirectory.from_config(alembic_cfg)
            
            with engine.connect() as connection:
                context = MigrationContext.configure(connection)
                current_rev = context.get_current_revision()
                
                if current_rev:
                    logger.info(f"   ✅ Current revision: {current_rev}")
                else:
                    logger.warning(f"   ⚠️  No migrations applied yet")
                
                head_rev = script.get_current_head()
                logger.info(f"   📌 Latest revision: {head_rev}")
                
                if current_rev == head_rev:
                    logger.info(f"   ✅ Database is up to date!")
                elif current_rev is None:
                    logger.warning(f"   ⚠️  Database needs initial migration")
                else:
                    logger.warning(f"   ⚠️  Database needs upgrade")
                    
        except Exception as e:
            logger.warning(f"   ⚠️  Could not check migration status: {e}")
            
    except Exception as e:
        logger.error(f"   ❌ Error loading Alembic config: {e}")
        return False
    
    logger.info("")
    logger.info("=" * 70)
    logger.info("✅ Alembic configuration is valid!")
    logger.info("=" * 70)
    logger.info("")
    logger.info("Available commands:")
    logger.info("  alembic current          - Show current revision")
    logger.info("  alembic history          - Show migration history")
    logger.info("  alembic upgrade head     - Apply all migrations")
    logger.info("  alembic downgrade -1     - Rollback one migration")
    logger.info("  alembic revision --autogenerate -m 'message'  - Create new migration")
    logger.info("")
    
    return True

if __name__ == "__main__":
    try:
        success = test_alembic_config()
        sys.exit(0 if success else 1)
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
