#!/usr/bin/env python
"""Check payment status for a given reference"""
import sys
from database import SessionLocal
from models import PendingCheckout, Order, WebhookEvent

def check_payment(reference):
    db = SessionLocal()
    try:
        # Check pending checkout
        pending = db.query(PendingCheckout).filter(
            PendingCheckout.payment_reference == reference
        ).first()
        
        # Check order
        order = db.query(Order).filter(
            Order.payment_reference == reference
        ).first()
        
        # Check webhook events
        webhooks = db.query(WebhookEvent).filter(
            WebhookEvent.payment_reference == reference
        ).all()
        
        print(f"Payment Reference: {reference}")
        print(f"=" * 60)
        
        if pending:
            print(f"✓ Pending Checkout Found:")
            print(f"  - Status: {pending.status}")
            print(f"  - Created: {pending.created_at}")
            print(f"  - Expires: {pending.expires_at}")
        else:
            print("✗ No Pending Checkout Found")
        
        print()
        
        if order:
            print(f"✓ Order Found:")
            print(f"  - Order ID: {order.id}")
            print(f"  - Order Number: {order.order_number}")
            print(f"  - Status: {order.status}")
            print(f"  - Payment Status: {order.payment_status}")
        else:
            print("✗ No Order Found")
        
        print()
        
        if webhooks:
            print(f"✓ Webhook Events Found ({len(webhooks)}):")
            for i, webhook in enumerate(webhooks, 1):
                print(f"  {i}. Event Type: {webhook.event_type}")
                print(f"     Status: {webhook.status}")
                print(f"     Created: {webhook.created_at}")
        else:
            print("✗ No Webhook Events Found")
            print("\n⚠ This means Paystack webhook was never received!")
            print("   Possible causes:")
            print("   1. Webhook not configured on Paystack dashboard")
            print("   2. Payment was not completed")
            print("   3. Webhook failed to deliver")
        
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check_payment.py <payment_reference>")
        sys.exit(1)
    
    check_payment(sys.argv[1])
