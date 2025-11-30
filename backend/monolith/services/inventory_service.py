import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
import models

logger = logging.getLogger(__name__)

class InsufficientStockException(Exception):
    def __init__(self, variant_id: int, available: int = 0, requested: int = 0):
        self.variant_id = variant_id
        self.available = available
        self.requested = requested
        super().__init__(f"Insufficient stock for variant {variant_id}")

def check_stock(db: Session, variant_id: int, quantity: int) -> bool:
    """
    Check if sufficient stock exists for a variant.
    """
    variant = db.query(models.ProductVariant).filter(
        models.ProductVariant.id == variant_id,
        models.ProductVariant.is_active == True
    ).first()
    
    if not variant:
        return False
        
    return variant.stock_quantity >= quantity

def reserve_stock(db: Session, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Atomically reserve stock for multiple items.
    
    Args:
        db: Database session
        items: List of dicts containing 'variant_id' and 'quantity'
        
    Returns:
        List of reserved items (for potential rollback)
        
    Raises:
        InsufficientStockException: If any item fails reservation
    """
    reserved_variants = []
    
    for item in items:
        variant_id = item["variant_id"]
        quantity = item["quantity"]
        
        updated_rows = db.query(models.ProductVariant).filter(
            models.ProductVariant.id == variant_id,
            models.ProductVariant.is_active == True,
            models.ProductVariant.stock_quantity >= quantity
        ).update(
            {"stock_quantity": models.ProductVariant.stock_quantity - quantity},
            synchronize_session='fetch'
        )
        
        if updated_rows == 0:
            # Fetch current stock for error message
            variant = db.query(models.ProductVariant).get(variant_id)
            available = variant.stock_quantity if variant else 0
            
            logger.error(f"Insufficient stock for variant {variant_id}. Requested: {quantity}, Available: {available}")
            raise InsufficientStockException(variant_id, available, quantity)
        
        reserved_variants.append({
            "variant_id": variant_id,
            "quantity": quantity
        })
        
    return reserved_variants

def release_stock(db: Session, items: List[Dict[str, Any]]):
    """
    Release/Restore stock for items.
    Used for rollbacks or order cancellations.
    """
    for item in items:
        variant_id = item["variant_id"]
        quantity = item["quantity"]
        
        db.query(models.ProductVariant).filter(
            models.ProductVariant.id == variant_id
        ).update(
            {"stock_quantity": models.ProductVariant.stock_quantity + quantity},
            synchronize_session='fetch'
        )
    
    logger.info(f"Released stock for {len(items)} items")
