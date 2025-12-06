# file: routers/payment_webhook.py
import json
import logging
import uuid
from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session

import models
from database import get_db
from utils.payment import paystack_client
from utils.notifications import send_order_confirmation
from utils.error_handling import SecureErrorHandler

router = APIRouter()
logger = logging.getLogger(__name__)

def generate_order_number() -> str:
    """Generate a unique order number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"ORD-{timestamp}-{unique_id}"

@router.post("/webhook")
async def paystack_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Handle Paystack webhook events for payment confirmation.
    """
    try:
        # Get raw body for signature verification
        body = await request.body()
        signature = request.headers.get("x-paystack-signature")
        
        if not signature:
            logger.warning("Webhook received without signature")
            raise HTTPException(status_code=400, detail="Missing signature")
        
        # Verify webhook signature
        if not paystack_client.verify_webhook_signature(body, signature):
            logger.warning("Invalid webhook signature")
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Parse event data
        event_data = json.loads(body.decode('utf-8'))
        event_type = event_data.get("event")
        data = event_data.get("data", {})
        event_id = event_data.get("id")  # Paystack event ID
        
        logger.info(f"Received webhook event: {event_type}, ID: {event_id}")
        
        # CRITICAL: Check for replay attacks - verify event hasn't been processed
        if event_id:
            existing_event = db.query(models.WebhookEvent).filter(
                models.WebhookEvent.event_id == event_id
            ).first()
            
            if existing_event:
                logger.warning(f"SECURITY: Duplicate webhook event detected: {event_id}")
                # Log the duplicate attempt with UUID to prevent collisions
                duplicate_event = models.WebhookEvent(
                    event_id=f"{event_id}_duplicate_{uuid.uuid4()}",
                    event_type=event_type,
                    payment_reference=data.get("reference"),
                    status="duplicate",
                    raw_data=body.decode('utf-8')
                )
                db.add(duplicate_event)
                db.commit()
                
                return {"status": "duplicate", "message": "Event already processed"}
        
        # Store webhook event for audit trail and replay protection
        webhook_event = models.WebhookEvent(
            event_id=event_id or f"no_id_{datetime.now().timestamp()}",
            event_type=event_type,
            payment_reference=data.get("reference"),
            status="processing",
            raw_data=body.decode('utf-8')
        )
        db.add(webhook_event)
        db.commit()
        
        # Process event based on type
        if event_type == "charge.success":
            result = handle_successful_payment(data, db, background_tasks)
            
            # Update webhook event status
            webhook_event.status = "processed" if result.get("status") == "success" else "failed"
            db.commit()
            
            return result
        elif event_type == "charge.failed":
            result = handle_failed_payment(data, db)
            webhook_event.status = "processed"
            db.commit()
            return result
        else:
            logger.info(f"Unhandled event type: {event_type}")
            webhook_event.status = "unhandled"
            db.commit()
            return {"status": "received"}
    
    except HTTPException:
        # Re-raise HTTP exceptions (client errors like 400/401) - don't retry these
        raise
    except Exception as e:
        logger.exception("Error processing webhook")
        # IMPORTANT: Return 5xx to allow Paystack to retry on transient errors
        # Paystack will retry webhooks that return 5xx status codes
        raise HTTPException(
            status_code=500,
            detail="Internal error processing webhook - will retry"
        )

def handle_successful_payment(data: dict, db: Session, background_tasks: BackgroundTasks):
    """Handle successful payment and create order with security validations"""
    try:
        reference = data.get("reference")
        paid_amount_kobo = data.get("amount")  # Amount in kobo from Paystack
        currency = data.get("currency", "").upper()
        
        logger.info(f"Processing successful payment: {reference}")
        
        # CRITICAL: Verify currency is NGN
        if currency != "NGN":
            logger.error(f"Invalid currency for payment {reference}: {currency}")
            return {
                "status": "error",
                "message": f"Invalid currency: {currency}. Only NGN is supported."
            }
        
        # Find pending checkout (must not be expired)
        from datetime import timezone as tz
        now_utc = datetime.now(tz.utc)
        pending = db.query(models.PendingCheckout).filter(
            models.PendingCheckout.payment_reference == reference,
            models.PendingCheckout.status == "pending",
            models.PendingCheckout.expires_at > now_utc  # SECURITY: Don't process expired checkouts
        ).first()
        
        if not pending:
            # Check if it was expired
            expired_checkout = db.query(models.PendingCheckout).filter(
                models.PendingCheckout.payment_reference == reference,
                models.PendingCheckout.status == "pending",
                models.PendingCheckout.expires_at <= now_utc
            ).first()
            
            if expired_checkout:
                logger.warning(f"Checkout expired for reference: {reference}")
                expired_checkout.status = "expired"
                db.commit()
                return {"status": "expired", "message": "Checkout session has expired"}
            
            logger.warning(f"No pending checkout found for reference: {reference}")
            return {"status": "not_found"}
        
        # Check if order already created (idempotency check)
        existing_order = db.query(models.Order).filter(
            models.Order.payment_reference == reference
        ).first()
        
        if existing_order:
            logger.info(f"Order already exists for reference: {reference}")
            return {"status": "already_processed"}
            
        # Use the order service to create the order
        from services import order_service
        return order_service.create_order_from_checkout(
            db=db,
            pending_checkout=pending,
            payment_reference=reference,
            paid_amount_kobo=paid_amount_kobo,
            background_tasks=background_tasks
        )
    
    except Exception as e:
        db.rollback()
        logger.exception("Error creating order from webhook")
        raise

def handle_failed_payment(data: dict, db: Session):
    """Handle failed payment"""
    reference = data.get("reference")
    logger.info(f"Processing failed payment: {reference}")
    
    # Find and mark pending checkout as failed
    pending = db.query(models.PendingCheckout).filter(
        models.PendingCheckout.payment_reference == reference,
        models.PendingCheckout.status == "pending"
    ).first()
    
    if pending:
        pending.status = "failed"
        db.commit()
    
    return {"status": "payment_failed"}
