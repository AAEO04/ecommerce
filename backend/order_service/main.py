# file: order_service/main.py
import os
import uuid
import requests
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from decimal import Decimal
from typing import List, Optional

# Import our shared models and schemas
from shared_models import models, schemas
from shared_models.database import SessionLocal, engine, get_db

# Payment configuration
PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY", "")
PAYSTACK_PUBLIC_KEY = os.getenv("PAYSTACK_PUBLIC_KEY", "")

# Notification service URL
NOTIFICATION_SERVICE_URL = os.getenv("NOTIFICATION_SERVICE_URL", "http://localhost:8004")

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Order Service API",
    description="E-commerce order processing service with payment integration",
    version="1.0.0"
)

def generate_order_number() -> str:
    """Generate a unique order number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"ORD-{timestamp}-{unique_id}"

def process_payment(amount: Decimal, email: str, reference: str) -> dict:
    """Process payment via Paystack"""
    if not PAYSTACK_SECRET_KEY:
        # Mock payment for development
        return {
            "status": "success",
            "reference": reference,
            "amount": float(amount) * 100,  # Paystack uses kobo/pesewas
            "message": "Payment processed successfully"
        }
    
    try:
        headers = {
            "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        
        # For now, we'll simulate a successful payment
        # In a real implementation, you'd integrate with Paystack's API
        return {
            "status": "success",
            "reference": reference,
            "amount": float(amount) * 100,
            "message": "Payment processed successfully"
        }
    except Exception as e:
        return {
            "status": "failed",
            "message": f"Payment processing failed: {str(e)}"
        }

def send_order_notification(order_id: int):
    """Send order notification to notification service"""
    try:
        requests.post(
            f"{NOTIFICATION_SERVICE_URL}/notifications/order/{order_id}",
            timeout=10
        )
    except Exception as e:
        print(f"Failed to send order notification: {e}")

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Order Service API!",
        "version": "1.0.0",
        "payment_status": "configured" if PAYSTACK_SECRET_KEY else "mock_mode"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    status = {"status": "healthy"}
    
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        status["database"] = "connected"
    except Exception as e:
        status["database"] = f"error: {str(e)}"
        status["status"] = "unhealthy"
    
    return status

@app.post("/checkout/", response_model=dict)
def process_checkout(
    checkout_data: schemas.CheckoutRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Process a customer's checkout request with payment integration.
    """
    try:
        # Generate order number and payment reference
        order_number = generate_order_number()
        payment_reference = f"pay_{str(uuid.uuid4()).replace('-', '')}"
        
        total_amount = Decimal('0.0')
        order_items_to_create = []
        stock_updates = []

        # 1. Validate stock and calculate total price
        for item in checkout_data.cart:
            variant = db.query(models.ProductVariant).filter(
                models.ProductVariant.id == item.variant_id,
                models.ProductVariant.is_active == True
            ).first()

            # Check if variant exists and is in stock
            if not variant:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Product variant ID {item.variant_id} not found"
                )
            
            if variant.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Insufficient stock for variant {variant.size} {variant.color or ''}. Available: {variant.stock_quantity}, Requested: {item.quantity}"
                )

            # Calculate item total
            item_total = variant.price * item.quantity
            total_amount += item_total
            
            # Prepare order item data
            order_items_to_create.append({
                "variant_id": variant.id,
                "quantity": item.quantity,
                "unit_price": variant.price,
                "total_price": item_total
            })
            
            # Track stock updates
            stock_updates.append({
                "variant": variant,
                "quantity_to_subtract": item.quantity
            })

        # 2. Process payment
        payment_result = process_payment(
            amount=total_amount,
            email=checkout_data.customer_email,
            reference=payment_reference
        )
        
        if payment_result["status"] != "success":
            raise HTTPException(
                status_code=400,
                detail=f"Payment failed: {payment_result.get('message', 'Unknown error')}"
            )

        # 3. Create the main Order record
        new_order = models.Order(
            order_number=order_number,
            status="confirmed",
            payment_status="paid",
            payment_method=checkout_data.payment_method,
            payment_reference=payment_reference,
            customer_name=checkout_data.customer_name,
            customer_email=checkout_data.customer_email,
            customer_phone=checkout_data.customer_phone,
            shipping_address=checkout_data.shipping_address,
            billing_address=checkout_data.billing_address or checkout_data.shipping_address,
            total_amount=total_amount,
            shipping_cost=Decimal('0.0'),  # Could be calculated based on location
            tax_amount=Decimal('0.0'),     # Could be calculated based on location
            notes=checkout_data.notes
        )
        db.add(new_order)
        db.flush()  # Get the order ID

        # 4. Create the OrderItem records
        for item_data in order_items_to_create:
            order_item = models.OrderItem(
                order_id=new_order.id,
                **item_data
            )
            db.add(order_item)

        # 5. Update stock quantities
        for stock_update in stock_updates:
            variant = stock_update["variant"]
            quantity_to_subtract = stock_update["quantity_to_subtract"]
            variant.stock_quantity -= quantity_to_subtract

        # 6. Commit the entire transaction
        db.commit()
        db.refresh(new_order)

        # 7. Send notification in background
        background_tasks.add_task(send_order_notification, new_order.id)

        return {
            "message": "Order placed successfully!",
            "order_id": new_order.id,
            "order_number": order_number,
            "payment_reference": payment_reference,
            "total_amount": float(total_amount),
            "status": "confirmed"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Order processing failed: {str(e)}")

@app.get("/orders/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get order details by ID"""
    
    order = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.variant)
    ).filter(models.Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return schemas.OrderResponse.from_orm(order)

@app.get("/orders/", response_model=List[schemas.OrderResponse])
def list_orders(
    customer_email: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List orders with optional filtering"""
    
    query = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.variant)
    )
    
    if customer_email:
        query = query.filter(models.Order.customer_email == customer_email)
    
    if status:
        query = query.filter(models.Order.status == status)
    
    orders = query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()
    return [schemas.OrderResponse.from_orm(order) for order in orders]

@app.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status_update: dict,
    db: Session = Depends(get_db)
):
    """Update order status"""
    
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update status fields
    if "status" in status_update:
        order.status = status_update["status"]
    
    if "payment_status" in status_update:
        order.payment_status = status_update["payment_status"]
    
    if "notes" in status_update:
        order.notes = status_update["notes"]
    
    db.commit()
    
    return {"message": "Order status updated successfully", "order_id": order_id}

@app.post("/orders/{order_id}/refund")
def process_refund(
    order_id: int,
    refund_amount: Optional[Decimal] = None,
    db: Session = Depends(get_db)
):
    """Process a refund for an order"""
    
    order = db.query(models.Order).options(
        joinedload(models.Order.items)
    ).filter(models.Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.payment_status != "paid":
        raise HTTPException(status_code=400, detail="Cannot refund unpaid order")
    
    # Calculate refund amount (full refund if not specified)
    if refund_amount is None:
        refund_amount = order.total_amount
    
    if refund_amount > order.total_amount:
        raise HTTPException(status_code=400, detail="Refund amount cannot exceed order total")
    
    # Process refund (mock implementation)
    refund_reference = f"refund_{str(uuid.uuid4()).replace('-', '')}"
    
    # Update order status
    order.payment_status = "refunded"
    order.status = "cancelled"
    
    # Restore stock quantities
    for item in order.items:
        variant = db.query(models.ProductVariant).filter(
            models.ProductVariant.id == item.variant_id
        ).first()
        if variant:
            variant.stock_quantity += item.quantity
    
    db.commit()
    
    return {
        "message": "Refund processed successfully",
        "order_id": order_id,
        "refund_amount": float(refund_amount),
        "refund_reference": refund_reference
    }

@app.get("/orders/by-number/{order_number}", response_model=schemas.OrderResponse)
def get_order_by_number(order_number: str, db: Session = Depends(get_db)):
    """Get order details by order number"""
    
    order = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.variant)
    ).filter(models.Order.order_number == order_number).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return schemas.OrderResponse.from_orm(order)