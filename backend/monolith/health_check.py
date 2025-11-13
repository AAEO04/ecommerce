"""
Comprehensive Backend Health Check System
Validates all backend components and dependencies
"""
import os
import sys
import logging
from pathlib import Path
from typing import Dict, List, Tuple
import importlib.util

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

class HealthCheck:
    def __init__(self):
        self.results: List[Tuple[str, bool, str]] = []
        self.critical_failures = 0
        self.warnings = 0
        
    def check(self, name: str, is_ok: bool, message: str, critical: bool = False):
        """Record a health check result"""
        self.results.append((name, is_ok, message))
        
        if not is_ok:
            if critical:
                self.critical_failures += 1
            else:
                self.warnings += 1
        
        # Print result immediately
        status = "✅" if is_ok else ("❌" if critical else "⚠️ ")
        logger.info(f"{status} {name}: {message}")
    
    def print_summary(self):
        """Print summary of all checks"""
        logger.info("")
        logger.info("=" * 70)
        logger.info("HEALTH CHECK SUMMARY")
        logger.info("=" * 70)
        
        total = len(self.results)
        passed = sum(1 for _, ok, _ in self.results if ok)
        failed = total - passed
        
        logger.info(f"Total Checks: {total}")
        logger.info(f"✅ Passed: {passed}")
        logger.info(f"❌ Failed: {failed}")
        logger.info(f"⚠️  Warnings: {self.warnings}")
        logger.info(f"🚨 Critical: {self.critical_failures}")
        logger.info("=" * 70)
        
        if self.critical_failures > 0:
            logger.error("\n🚨 CRITICAL FAILURES DETECTED - System cannot start!")
            return False
        elif self.warnings > 0:
            logger.warning("\n⚠️  WARNINGS DETECTED - System may have issues")
            return True
        else:
            logger.info("\n✅ ALL CHECKS PASSED - System is healthy!")
            return True

def check_python_version(hc: HealthCheck):
    """Check Python version"""
    version = sys.version_info
    is_ok = version.major == 3 and version.minor >= 10
    hc.check(
        "Python Version",
        is_ok,
        f"{version.major}.{version.minor}.{version.micro} {'(OK)' if is_ok else '(Requires 3.10+)'}",
        critical=True
    )

def check_environment_file(hc: HealthCheck):
    """Check if .env file exists"""
    env_paths = [
        Path(__file__).parent.parent.parent / '.env',
        Path(__file__).parent.parent / '.env',
        Path(__file__).parent / '.env',
    ]
    
    env_found = False
    env_path = None
    
    for path in env_paths:
        if path.exists():
            env_found = True
            env_path = path
            break
    
    hc.check(
        "Environment File",
        env_found,
        f"Found at {env_path}" if env_found else "Not found (.env missing)",
        critical=True
    )
    
    return env_path

def check_required_env_vars(hc: HealthCheck):
    """Check required environment variables"""
    from dotenv import load_dotenv
    
    # Try to load .env
    env_path = check_environment_file(hc)
    if env_path:
        load_dotenv(env_path)
    
    required_vars = [
        'DATABASE_URL',
        'JWT_SECRET_KEY',
        'ENCRYPTION_KEY',
    ]
    
    for var in required_vars:
        value = os.getenv(var)
        is_ok = value is not None and value != ''
        hc.check(
            f"ENV: {var}",
            is_ok,
            "Set" if is_ok else "Missing or empty",
            critical=True
        )

def check_dependencies(hc: HealthCheck):
    """Check if required Python packages are installed"""
    required_packages = [
        ('fastapi', 'FastAPI'),
        ('sqlalchemy', 'SQLAlchemy'),
        ('psycopg2', 'PostgreSQL Driver'),
        ('alembic', 'Alembic'),
        ('pydantic', 'Pydantic'),
        ('uvicorn', 'Uvicorn'),
        ('redis', 'Redis Client'),
        ('jose', 'Python-JOSE'),
        ('passlib', 'Passlib'),
        ('python_multipart', 'Python Multipart'),
    ]
    
    for package, name in required_packages:
        try:
            spec = importlib.util.find_spec(package)
            is_ok = spec is not None
            hc.check(
                f"Package: {name}",
                is_ok,
                "Installed" if is_ok else "Not installed",
                critical=True
            )
        except Exception as e:
            hc.check(
                f"Package: {name}",
                False,
                f"Error checking: {e}",
                critical=True
            )

def check_database_connection(hc: HealthCheck):
    """Check database connectivity"""
    try:
        from database import engine
        from sqlalchemy import text
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            is_ok = result.scalar() == 1
            hc.check(
                "Database Connection",
                is_ok,
                "Connected successfully" if is_ok else "Connection failed",
                critical=True
            )
            return is_ok
    except Exception as e:
        hc.check(
            "Database Connection",
            False,
            f"Error: {str(e)[:100]}",
            critical=True
        )
        return False

def check_database_tables(hc: HealthCheck):
    """Check if all required tables exist"""
    try:
        from sqlalchemy import inspect
        from database import engine
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        required_tables = [
            'categories',
            'products',
            'productvariants',
            'productimages',
            'customers',
            'orders',
            'orderitems',
            'admin_users',
            'admin_invites',
            'password_resets',
            'payments',
        ]
        
        for table in required_tables:
            is_ok = table in tables
            hc.check(
                f"Table: {table}",
                is_ok,
                "Exists" if is_ok else "Missing",
                critical=False
            )
        
        return len(tables) > 0
        
    except Exception as e:
        hc.check(
            "Database Tables",
            False,
            f"Error checking tables: {str(e)[:100]}",
            critical=False
        )
        return False

def check_admin_users_schema(hc: HealthCheck):
    """Check if admin_users table has correct schema"""
    try:
        from sqlalchemy import inspect
        from database import engine
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if 'admin_users' not in tables:
            hc.check(
                "admin_users Schema",
                False,
                "Table does not exist",
                critical=True
            )
            return False
        
        columns = [col['name'] for col in inspector.get_columns('admin_users')]
        
        required_columns = ['id', 'email', 'hashed_password', 'role', 'is_active']
        
        for col in required_columns:
            is_ok = col in columns
            hc.check(
                f"Column: admin_users.{col}",
                is_ok,
                "Exists" if is_ok else "Missing",
                critical=(col == 'email')  # email is critical
            )
        
        return 'email' in columns
        
    except Exception as e:
        hc.check(
            "admin_users Schema",
            False,
            f"Error: {str(e)[:100]}",
            critical=True
        )
        return False

def check_redis_connection(hc: HealthCheck):
    """Check Redis connectivity"""
    try:
        import redis
        
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
        r = redis.from_url(redis_url, decode_responses=True)
        
        r.ping()
        hc.check(
            "Redis Connection",
            True,
            "Connected successfully",
            critical=False
        )
        return True
    except Exception as e:
        hc.check(
            "Redis Connection",
            False,
            f"Not available: {str(e)[:50]}",
            critical=False
        )
        return False

def check_alembic_config(hc: HealthCheck):
    """Check Alembic configuration"""
    alembic_ini = Path(__file__).parent / 'alembic.ini'
    alembic_env = Path(__file__).parent / 'alembic' / 'env.py'
    
    is_ok = alembic_ini.exists() and alembic_env.exists()
    hc.check(
        "Alembic Configuration",
        is_ok,
        "Configured" if is_ok else "Missing files",
        critical=False
    )

def check_file_structure(hc: HealthCheck):
    """Check if required files and directories exist"""
    base_path = Path(__file__).parent
    
    required_items = [
        ('main.py', 'file'),
        ('models.py', 'file'),
        ('database.py', 'file'),
        ('schemas.py', 'file'),
        ('config.py', 'file'),
        ('routers', 'dir'),
        ('utils', 'dir'),
        ('alembic', 'dir'),
    ]
    
    for item, item_type in required_items:
        path = base_path / item
        if item_type == 'file':
            is_ok = path.is_file()
        else:
            is_ok = path.is_dir()
        
        hc.check(
            f"File: {item}",
            is_ok,
            "Exists" if is_ok else "Missing",
            critical=True
        )

def main():
    logger.info("=" * 70)
    logger.info("🏥 BACKEND HEALTH CHECK")
    logger.info("=" * 70)
    logger.info("")
    
    hc = HealthCheck()
    
    # Run all checks
    logger.info("📋 Running health checks...\n")
    
    logger.info("1️⃣  System Checks")
    logger.info("-" * 70)
    check_python_version(hc)
    check_file_structure(hc)
    logger.info("")
    
    logger.info("2️⃣  Environment Checks")
    logger.info("-" * 70)
    check_required_env_vars(hc)
    logger.info("")
    
    logger.info("3️⃣  Dependency Checks")
    logger.info("-" * 70)
    check_dependencies(hc)
    logger.info("")
    
    logger.info("4️⃣  Database Checks")
    logger.info("-" * 70)
    if check_database_connection(hc):
        check_database_tables(hc)
        check_admin_users_schema(hc)
    logger.info("")
    
    logger.info("5️⃣  External Service Checks")
    logger.info("-" * 70)
    check_redis_connection(hc)
    logger.info("")
    
    logger.info("6️⃣  Configuration Checks")
    logger.info("-" * 70)
    check_alembic_config(hc)
    logger.info("")
    
    # Print summary
    is_healthy = hc.print_summary()
    
    # Exit with appropriate code
    sys.exit(0 if is_healthy and hc.critical_failures == 0 else 1)

if __name__ == "__main__":
    main()
