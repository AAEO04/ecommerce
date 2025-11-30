import logging
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Dict, Any, Optional

from sqlalchemy.orm import Session
from sqlalchemy import case

import models
from utils.notifications import send_order_confirmation

logger = logging.getLogger(__name__)

def generate_order_number() -> str:
    """Generate a unique order number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"ORD-{timestamp}-{unique_id}"

def create_order_from_checkout(
    db: Session, 
    pending_checkout: models.PendingCheckout, 
    payment_reference: str,
    paid_amount_kobo: Optional[int] = None,
    background_tasks: Optional[Any] = None  # Type Any to avoid circular import if needed, or import BackgroundTasks
) -> Dict[str, Any]:
    """
    Process a pending checkout and create an order.
    Handles customer creation, stock reservation, and order creation.
    
    Args:
        db: Database session
        pending_checkout: The pending checkout record
        payment_reference: The payment reference from the gateway
        paid_amount_kobo: Optional amount paid in kobo (for verification)
        background_tasks: FastAPI BackgroundTasks object
        
    Returns:
        Dict with status and result details
    """
    try:
        # Parse checkout data
        checkout_info = pending_checkout.checkout_data
        checkout_data = checkout_info["checkout_data"]
        cart_items = checkout_info["cart_items"]
        total_amount = Decimal(str(checkout_info["total_amount"]))
        
        # Security Check: Verify payment amount if provided
        if paid_amount_kobo is not None:
            expected_amount_kobo = int(total_amount * 100)
            if paid_amount_kobo != expected_amount_kobo:
                logger.error(
                    f"SECURITY ALERT: Payment amount mismatch for {payment_reference}! "
                    f"Expected: ₦{total_amount} ({expected_amount_kobo} kobo), "
                    f"Paid: {paid_amount_kobo} kobo (₦{paid_amount_kobo/100})"
                )
                pending_checkout.status = "failed"
                db.commit()
                return {
                    "status": "amount_mismatch",
                    "message": "Payment amount does not match order total",
                    "expected": expected_amount_kobo,
                    "received": paid_amount_kobo
                }
        
        # Find or create customer
        customer = db.query(models.Customer).filter(
            models.Customer.email == checkout_data["customer_email"]
        ).first()
        
        if not customer:
            name_parts = checkout_data["customer_name"].split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""
            
            customer = models.Customer(
                email=checkout_data["customer_email"],
                phone=checkout_data["customer_phone"],
                first_name=first_name,
                last_name=last_name,
                is_active=True
            )
            db.add(customer)
            db.flush()
            
        # Reserve stock atomically
        from services import inventory_service
        reserved_variants = []
        try:
            reserved_variants = inventory_service.reserve_stock(db, cart_items)
            
            # Create order
            order_number = generate_order_number()
            new_order = models.Order(
                order_number=order_number,
                idempotency_key=checkout_data["idempotency_key"],
                status="confirmed",
                payment_status="paid",
                payment_method=checkout_data["payment_method"],
                payment_reference=payment_reference,
                customer_id=customer.id,
                customer_name=checkout_data["customer_name"],
                customer_email=checkout_data["customer_email"],
                customer_phone=checkout_data["customer_phone"],
                shipping_address=checkout_data["shipping_address"],
                billing_address=checkout_data.get("billing_address") or checkout_data["shipping_address"],
                total_amount=total_amount,
                shipping_cost=Decimal('0.0'),
                tax_amount=Decimal('0.0'),
                notes=checkout_data.get("notes")
            )
            db.add(new_order)
            db.flush()
            
            # Create order items
            for item_data in cart_items:
                order_item = models.OrderItem(
                    order_id=new_order.id,
                    variant_id=item_data["variant_id"],
                    quantity=item_data["quantity"],
                    unit_price=Decimal(str(item_data["unit_price"])),
                    total_price=Decimal(str(item_data["total_price"]))
                )
                db.add(order_item)
            
            # Update pending checkout status
            pending_checkout.status = "completed"
            
            # Commit transaction
            db.commit()
            db.refresh(new_order)
            
            # Send confirmation email (Async)
            try:
                if background_tasks:
                    background_tasks.add_task(send_order_confirmation, new_order)
                    logger.info(f"Queued confirmation email for order {order_number}")
                else:
                    # Fallback for scripts/tests without background tasks
                    logger.warning("No background_tasks provided, sending email synchronously")
                    send_order_confirmation(new_order)
            except Exception as e:
                logger.error(f"Failed to queue confirmation email: {e}")
            
            logger.info(f"Order created successfully: {order_number}")
            return {"status": "success", "order_number": order_number}
            
        except Exception as stock_error:
            # Rollback stock reservations
            logger.error(f"Error during order creation, rolling back stock: {stock_error}")
            
            if reserved_variants:
                inventory_service.release_stock(db, reserved_variants)
            
            pending_checkout.status = "failed"
            db.commit()
            return {"status": "insufficient_stock", "message": str(stock_error)}
            
    except Exception as e:
        db.rollback()
        logger.exception("Error creating order")
        raise e
