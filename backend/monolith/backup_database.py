"""
Database Backup Script for MAD RUSH
Automated PostgreSQL database backup with rotation
"""
import os
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
BACKUP_DIR = Path(__file__).parent / "backups"
BACKUP_RETENTION_DAYS = 30  # Keep backups for 30 days
DATABASE_URL = os.getenv("DATABASE_URL")

# Parse database connection details
if DATABASE_URL:
    # Format: postgresql://user:password@host:port/database
    parts = DATABASE_URL.replace("postgresql://", "").split("@")
    user_pass = parts[0].split(":")
    host_db = parts[1].split("/")
    host_port = host_db[0].split(":")
    
    DB_USER = user_pass[0]
    DB_PASSWORD = user_pass[1]
    DB_HOST = host_port[0]
    DB_PORT = host_port[1] if len(host_port) > 1 else "5432"
    DB_NAME = host_db[1]
else:
    # Fallback to individual env vars
    DB_USER = os.getenv("DATABASE_USER", "madrush_user")
    DB_PASSWORD = os.getenv("DATABASE_PASSWORD")
    DB_HOST = os.getenv("DATABASE_HOST", "localhost")
    DB_PORT = os.getenv("DATABASE_PORT", "5432")
    DB_NAME = os.getenv("DATABASE_NAME", "madrush_db")


def create_backup():
    """Create a database backup"""
    try:
        # Create backup directory if it doesn't exist
        BACKUP_DIR.mkdir(exist_ok=True)
        
        # Generate backup filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = BACKUP_DIR / f"backup_{timestamp}.sql"
        compressed_file = BACKUP_DIR / f"backup_{timestamp}.sql.gz"
        
        logger.info(f"Starting database backup: {DB_NAME}")
        
        # Set password environment variable for pg_dump
        env = os.environ.copy()
        env["PGPASSWORD"] = DB_PASSWORD
        
        # Run pg_dump
        dump_command = [
            "pg_dump",
            "-h", DB_HOST,
            "-p", DB_PORT,
            "-U", DB_USER,
            "-F", "p",  # Plain text format
            "-f", str(backup_file),
            DB_NAME
        ]
        
        result = subprocess.run(
            dump_command,
            env=env,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            logger.error(f"Backup failed: {result.stderr}")
            return False
        
        # Compress the backup
        logger.info("Compressing backup...")
        compress_command = ["gzip", str(backup_file)]
        subprocess.run(compress_command, check=True)
        
        # Get file size
        size_mb = compressed_file.stat().st_size / (1024 * 1024)
        
        logger.info(f"✅ Backup created successfully: {compressed_file.name} ({size_mb:.2f} MB)")
        return True
        
    except Exception as e:
        logger.error(f"❌ Backup failed: {e}")
        return False


def cleanup_old_backups():
    """Remove backups older than BACKUP_RETENTION_DAYS"""
    try:
        if not BACKUP_DIR.exists():
            return
        
        cutoff_date = datetime.now() - timedelta(days=BACKUP_RETENTION_DAYS)
        removed_count = 0
        
        for backup_file in BACKUP_DIR.glob("backup_*.sql.gz"):
            # Extract timestamp from filename
            try:
                timestamp_str = backup_file.stem.replace("backup_", "").replace(".sql", "")
                file_date = datetime.strptime(timestamp_str, "%Y%m%d_%H%M%S")
                
                if file_date < cutoff_date:
                    backup_file.unlink()
                    removed_count += 1
                    logger.info(f"Removed old backup: {backup_file.name}")
            except (ValueError, IndexError):
                # Skip files that don't match the expected format
                continue
        
        if removed_count > 0:
            logger.info(f"✅ Cleaned up {removed_count} old backup(s)")
        else:
            logger.info("No old backups to clean up")
            
    except Exception as e:
        logger.error(f"❌ Cleanup failed: {e}")


def list_backups():
    """List all available backups"""
    if not BACKUP_DIR.exists():
        logger.info("No backups directory found")
        return
    
    backups = sorted(BACKUP_DIR.glob("backup_*.sql.gz"), reverse=True)
    
    if not backups:
        logger.info("No backups found")
        return
    
    logger.info(f"\n📦 Available Backups ({len(backups)} total):")
    logger.info("=" * 60)
    
    for backup in backups:
        size_mb = backup.stat().st_size / (1024 * 1024)
        modified = datetime.fromtimestamp(backup.stat().st_mtime)
        logger.info(f"  {backup.name:<35} {size_mb:>8.2f} MB  {modified.strftime('%Y-%m-%d %H:%M:%S')}")
    
    logger.info("=" * 60)


def restore_backup(backup_file: str):
    """Restore database from a backup file"""
    try:
        backup_path = BACKUP_DIR / backup_file
        
        if not backup_path.exists():
            logger.error(f"Backup file not found: {backup_file}")
            return False
        
        logger.warning(f"⚠️  This will REPLACE the current database: {DB_NAME}")
        logger.warning("⚠️  Make sure you have a recent backup before proceeding!")
        
        confirm = input("Type 'YES' to confirm restore: ")
        if confirm != "YES":
            logger.info("Restore cancelled")
            return False
        
        # Decompress if needed
        if backup_path.suffix == ".gz":
            logger.info("Decompressing backup...")
            sql_file = backup_path.with_suffix("")
            subprocess.run(["gunzip", "-k", str(backup_path)], check=True)
        else:
            sql_file = backup_path
        
        # Set password environment variable
        env = os.environ.copy()
        env["PGPASSWORD"] = DB_PASSWORD
        
        # Restore database
        logger.info(f"Restoring database from: {backup_file}")
        
        restore_command = [
            "psql",
            "-h", DB_HOST,
            "-p", DB_PORT,
            "-U", DB_USER,
            "-d", DB_NAME,
            "-f", str(sql_file)
        ]
        
        result = subprocess.run(
            restore_command,
            env=env,
            capture_output=True,
            text=True
        )
        
        # Clean up decompressed file
        if sql_file != backup_path:
            sql_file.unlink()
        
        if result.returncode != 0:
            logger.error(f"Restore failed: {result.stderr}")
            return False
        
        logger.info("✅ Database restored successfully")
        return True
        
    except Exception as e:
        logger.error(f"❌ Restore failed: {e}")
        return False


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Database backup and restore utility")
    parser.add_argument("--backup", action="store_true", help="Create a new backup")
    parser.add_argument("--cleanup", action="store_true", help="Remove old backups")
    parser.add_argument("--list", action="store_true", help="List all backups")
    parser.add_argument("--restore", type=str, help="Restore from backup file")
    parser.add_argument("--auto", action="store_true", help="Automatic mode (backup + cleanup)")
    
    args = parser.parse_args()
    
    if args.auto:
        # Automated backup with cleanup (for cron jobs)
        logger.info("🔄 Running automated backup...")
        if create_backup():
            cleanup_old_backups()
    elif args.backup:
        create_backup()
    elif args.cleanup:
        cleanup_old_backups()
    elif args.list:
        list_backups()
    elif args.restore:
        restore_backup(args.restore)
    else:
        # Default: create backup
        logger.info("No action specified. Creating backup...")
        create_backup()
