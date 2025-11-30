"""
Scheduled job to clean up expired pending checkouts
Run this periodically (e.g., every 15 minutes) via cron or task scheduler
"""
import sys
import os
from datetime import datetime
import logging

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from database import SessionLocal
import models

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def cleanup_expired_checkouts(db: Session) -> dict:
    """
    Clean up expired pending checkouts
    
    Returns:
        dict: Statistics about the cleanup operation
    """
    try:
        # Find expired pending checkouts
        expired_checkouts = db.query(models.PendingCheckout).filter(
            models.PendingCheckout.status == "pending",
            models.PendingCheckout.expires_at < datetime.now()
        ).all()
        
        count = len(expired_checkouts)
        
        if count == 0:
            logger.info("No expired pending checkouts found")
            return {"expired_count": 0, "status": "success"}
        
        logger.info(f"Found {count} expired pending checkouts")
        
        # Mark as expired instead of deleting (for audit trail)
        for checkout in expired_checkouts:
            checkout.status = "expired"
            logger.info(f"Marked checkout as expired: {checkout.payment_reference}")
        
        # Commit changes
        db.commit()
        
        logger.info(f"Successfully cleaned up {count} expired checkouts")
        
        return {
            "expired_count": count,
            "status": "success",
            "message": f"Cleaned up {count} expired checkouts"
        }
        
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}")
        db.rollback()
        return {
            "expired_count": 0,
            "status": "error",
            "message": str(e)
        }


def main():
    """Main entry point for the cleanup job"""
    logger.info("Starting expired checkout cleanup job")
    
    db = SessionLocal()
    try:
        result = cleanup_expired_checkouts(db)
        logger.info(f"Cleanup completed: {result}")
        
        if result["status"] == "error":
            sys.exit(1)
        
    except Exception as e:
        logger.exception("Fatal error in cleanup job")
        sys.exit(1)
    finally:
        db.close()
    
    logger.info("Cleanup job finished successfully")


if __name__ == "__main__":
    main()
