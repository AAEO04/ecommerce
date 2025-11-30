"""
Manual script to process pending checkouts and create orders
Run this after successful Paystack payment to simulate webhook
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy.orm import Session
from database import SessionLocal
import models
import json
from decimal import Decimal
from datetime import datetime
import uuid

def generate_order_number() -> str:
    """Generate a unique order number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"ORD-{timestamp}-{unique_id}"

def process_pending_checkout(payment_reference: str, db: Session):
    """Process a pending checkout and create an order"""
    
    # Find pending checkout
    pending = db.query(models.PendingCheckout).filter(
        models.PendingCheckout.payment_reference == payment_reference,
        models.PendingCheckout.status == "pending"
    ).first()
    
    if not pending:
        print(f"❌ No pending checkout found for reference: {payment_reference}")
        return
    
    # Check if order already exists
    existing_order = db.query(models.Order).filter(
        models.Order.payment_reference == payment_reference
    ).first()
    
    if existing_order:
        print(f"✅ Order already exists: {existing_order.order_number}")
        return
    
    # Use the order service to create the order
    from services import order_service
    result = order_service.create_order_from_checkout(
        db=db,
        pending_checkout=pending,
        payment_reference=payment_reference
    )
    
    if result["status"] == "success":
        print(f"✅ Order created successfully: {result['order_number']}")
        print(f"📧 Customer: {pending.checkout_data['checkout_data']['customer_email']}")
        print(f"💳 Payment reference: {payment_reference}")
        return result['order_number']
    else:
        print(f"❌ Order creation failed: {result.get('message', 'Unknown error')}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_pending_checkout.py <payment_reference>")
        print("\nOr to process the latest pending checkout:")
        print("python process_pending_checkout.py --latest")
        sys.exit(1)
    
    db = SessionLocal()
    try:
        if sys.argv[1] == "--latest":
            # Get the latest pending checkout
            latest = db.query(models.PendingCheckout).filter(
                models.PendingCheckout.status == "pending"
            ).order_by(models.PendingCheckout.created_at.desc()).first()
            
            if not latest:
                print("❌ No pending checkouts found")
                sys.exit(1)
            
            print(f"Processing latest pending checkout: {latest.payment_reference}")
            process_pending_checkout(latest.payment_reference, db)
        else:
            payment_ref = sys.argv[1]
            process_pending_checkout(payment_ref, db)
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()
