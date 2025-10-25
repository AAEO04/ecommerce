# file: routers/orders.py
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from decimal import Decimal
from typing import List, Optional

import models
import schemas
from database import get_db
from utils.payment import process_payment
from utils.notifications import send_order_confirmation
from utils.rate_limiting import checkout_rate_limit
from utils.error_handling import SecureErrorHandler

router = APIRouter()

def generate_order_number() -> str:
    """Generate a unique order number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"ORD-{timestamp}-{unique_id}"

@router.post("/checkout")
@checkout_rate_limit()
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

        # 1. Validate stock and calculate total price with atomic operations
        for item in checkout_data.cart:
            # Use atomic update to check and reserve stock
            updated_rows = db.query(models.ProductVariant).filter(
                models.ProductVariant.id == item.variant_id,
                models.ProductVariant.is_active == True,
                models.ProductVariant.stock_quantity >= item.quantity
            ).update({
                "stock_quantity": models.ProductVariant.stock_quantity - item.quantity
            })
            
            if updated_rows == 0:
                # Check if variant exists
                variant = db.query(models.ProductVariant).filter(
                    models.ProductVariant.id == item.variant_id,
                    models.ProductVariant.is_active == True
                ).first()
                
                if not variant:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Product variant ID {item.variant_id} not found"
                    )
                else:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Insufficient stock for variant {variant.size} {variant.color or ''}. Available: {variant.stock_quantity}, Requested: {item.quantity}"
                    )
            
            # Get the updated variant
            variant = db.query(models.ProductVariant).filter(
                models.ProductVariant.id == item.variant_id
            ).first()

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
            shipping_cost=Decimal('0.0'),
            tax_amount=Decimal('0.0'),
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

        # 5. Stock already updated atomically in step 1

        # 6. Commit the entire transaction
        db.commit()
        db.refresh(new_order)

        # 7. Send notification in background
        background_tasks.add_task(send_order_confirmation, new_order)

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
        return SecureErrorHandler.handle_generic_error(e, "order processing")

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get order details by ID"""
    
    order = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.variant)
    ).filter(models.Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return schemas.OrderResponse.from_orm(order)

@router.get("/")
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

@router.get("/by-number/{order_number}", response_model=schemas.OrderResponse)
def get_order_by_number(order_number: str, db: Session = Depends(get_db)):
    """Get order details by order number"""
    
    order = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.variant)
    ).filter(models.Order.order_number == order_number).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return schemas.OrderResponse.from_orm(order)

@router.post("/{order_id}/refund")
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

