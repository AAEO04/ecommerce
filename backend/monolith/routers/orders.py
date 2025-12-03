# file: routers/orders.py
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.exc import IntegrityError
from sqlalchemy import case
from sqlalchemy.orm import selectinload

import models
import schemas
from database import get_db
from config import settings
from utils.payment import process_payment
from utils import auth
from utils.notifications import send_order_confirmation
from utils.rate_limiting import checkout_rate_limit
from utils.error_handling import SecureErrorHandler
from utils.exceptions import ProductNotFoundException, InsufficientStockException, PaymentFailedException

router = APIRouter()

def generate_order_number() -> str:
    """Generate a unique order number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"ORD-{timestamp}-{unique_id}"

import logging

logger = logging.getLogger(__name__)

@router.post("/validate-cart")
def validate_cart(
    validation_data: schemas.CartValidationRequest,
    db: Session = Depends(get_db)
):
    """Validate cart items stock availability"""
    for item in validation_data.cart:
        variant = db.query(models.ProductVariant).filter(
            models.ProductVariant.id == item.variant_id,
            models.ProductVariant.is_active == True
        ).first()
        
        if not variant:
            raise ProductNotFoundException(product_id=item.variant_id)
        
        if variant.stock_quantity < item.quantity:
            raise InsufficientStockException(
                variant_id=variant.id,
                available=variant.stock_quantity,
                requested=item.quantity
            )
            
    return {"status": "valid", "message": "Cart is valid"}


@router.post("/checkout")
@checkout_rate_limit()
def process_checkout(
    request: Request,
    checkout_data: schemas.CheckoutRequest,
    db: Session = Depends(get_db)
):
    logger.info(f"Initializing checkout: {checkout_data.dict()}")
    """
    Initialize checkout and return Paystack payment URL.
    Order will be created after payment confirmation via webhook.
    """
    try:
        logger.info("Step 1: Checking for existing orders/pending checkouts")
        # Check for existing pending checkout or completed order
        if checkout_data.idempotency_key:
            # Check if order already exists
            existing_order = db.query(models.Order).filter(
                models.Order.idempotency_key == checkout_data.idempotency_key
            ).first()
            
            if existing_order:
                return {
                    "message": "Order already processed",
                    "order_id": existing_order.id,
                    "order_number": existing_order.order_number,
                    "payment_reference": existing_order.payment_reference,
                    "total_amount": float(existing_order.total_amount),
                    "status": existing_order.status,
                    "payment_completed": True
                }
            
            # Check for existing pending checkout
            existing_pending = db.query(models.PendingCheckout).filter(
                models.PendingCheckout.idempotency_key == checkout_data.idempotency_key,
                models.PendingCheckout.status == "pending"
            ).first()
            
            if existing_pending:
                # Return existing payment URL
                import json
                stored_data = existing_pending.checkout_data
                return {
                    "message": "Payment already initialized",
                    "payment_reference": existing_pending.payment_reference,
                    "authorization_url": stored_data.get("authorization_url"),
                    "access_code": stored_data.get("access_code"),
                    "total_amount": stored_data.get("total_amount")
                }

        logger.info("Step 2: Generating payment reference")
        # Generate payment reference
        payment_reference = f"pay_{str(uuid.uuid4()).replace('-', '')}"
        
        total_amount = Decimal('0.0')
        cart_items = []

        logger.info("Step 3: Validating stock and calculating total")
        # 1. Validate stock and calculate total
        for item in checkout_data.cart:
            variant = db.query(models.ProductVariant).filter(
                models.ProductVariant.id == item.variant_id,
                models.ProductVariant.is_active == True
            ).first()
            
            if not variant:
                logger.error(f"Variant not found: {item.variant_id}")
                raise ProductNotFoundException(product_id=item.variant_id)
            
            if variant.stock_quantity < item.quantity:
                logger.error(f"Insufficient stock for variant {variant.id}: available={variant.stock_quantity}, requested={item.quantity}")
                raise InsufficientStockException(
                    variant_id=variant.id,
                    available=variant.stock_quantity,
                    requested=item.quantity
                )
            
            # Calculate item total
            item_total = variant.price * item.quantity
            total_amount += item_total
            
            cart_items.append({
                "variant_id": variant.id,
                "quantity": item.quantity,
                "unit_price": float(variant.price),
                "total_price": float(item_total)
            })
        
        logger.info(f"Step 4: Stock validated. Total amount: {total_amount}")

        # 2. Initialize Paystack payment
        logger.info(f"Step 5: Initializing Paystack payment for amount: {total_amount}")
        logger.info(f"Payment mode: {settings.PAYMENT_MODE}")
        logger.info(f"Paystack secret key configured: {bool(settings.PAYSTACK_SECRET_KEY)}")
        
        payment_result = process_payment(
            amount=total_amount,
            email=checkout_data.customer_email,
            reference=payment_reference,
            callback_url=f"{request.base_url}api/payment/callback"
        )
        
        logger.info(f"Payment result: {payment_result}")
        
        if payment_result["status"] != "success":
            logger.error(f"Payment initialization failed: {payment_result}")
            raise PaymentFailedException(reason=payment_result.get('message', 'Payment initialization failed'))

        # 3. Store pending checkout data
        import json
        from datetime import timedelta
        
        pending_data = {
            "checkout_data": checkout_data.dict(),
            "cart_items": cart_items,
            "total_amount": float(total_amount),
            "authorization_url": payment_result.get("authorization_url"),
            "access_code": payment_result.get("access_code"),
            "currency": "NGN"  # Add currency to pending data
        }
        
        pending_checkout = models.PendingCheckout(
            idempotency_key=checkout_data.idempotency_key,
            payment_reference=payment_reference,
            checkout_data=pending_data,
            status="pending",
            expires_at=datetime.now() + timedelta(hours=1)
        )
        db.add(pending_checkout)
        db.commit()
        
        logger.info(f"Checkout initialized. Payment reference: {payment_reference}")

        return {
            "message": "Payment initialized successfully",
            "payment_reference": payment_reference,
            "authorization_url": payment_result.get("authorization_url"),
            "access_code": payment_result.get("access_code"),
            "total_amount": float(total_amount)
        }
        
    except IntegrityError as e:
        db.rollback()
        # Another request created the order concurrently
        existing_order = db.query(models.Order).filter(
            models.Order.idempotency_key == checkout_data.idempotency_key
        ).first()

        if existing_order:
            return {
                "message": "Order already processed",
                "order_id": existing_order.id,
                "order_number": existing_order.order_number,
                "payment_reference": existing_order.payment_reference,
                "total_amount": float(existing_order.total_amount),
                "status": existing_order.status
            }
        raise HTTPException(status_code=500, detail="Order creation failed")

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        return SecureErrorHandler.handle_generic_error(e, "order processing")

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db), current_admin: dict = Depends(auth.get_current_admin_from_cookie)):
    """Get order details by ID"""
    
    order = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.variant)
    ).filter(models.Order.id == order_id).first()
    
    if not order:
        raise ProductNotFoundException(product_id=order_id)
    
    return schemas.OrderResponse.from_orm(order)

@router.get("/")
def list_orders(
    customer_email: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(auth.get_current_admin_from_cookie)
):
    """List orders with optional filtering"""
    
    query = db.query(models.Order).options(
        selectinload(models.Order.items)
        .selectinload(models.OrderItem.variant)
        .selectinload(models.ProductVariant.product)
    )
    
    if customer_email:
        query = query.filter(models.Order.customer_email == customer_email)
    
    if status:
        query = query.filter(models.Order.status == status)
    
    orders = query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()
    return [schemas.OrderResponse.from_orm(order) for order in orders]

@router.get("/by-number/{order_number}", response_model=schemas.OrderResponse)
def get_order_by_number(order_number: str, db: Session = Depends(get_db), current_admin: dict = Depends(auth.get_current_admin_from_cookie)):
    """Get order details by order number"""

    order = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.variant)
    ).filter(models.Order.order_number == order_number).first()

    if not order:
        raise ProductNotFoundException(product_id=order_number)    
    return schemas.OrderResponse.from_orm(order)

@router.post("/{order_id}/refund")
def process_refund(
    order_id: int,
    refund_amount: Optional[Decimal] = None,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(auth.get_current_admin_from_cookie)
):
    """Process a refund for an order"""
    
    order = db.query(models.Order).options(
        joinedload(models.Order.items)
    ).filter(models.Order.id == order_id).first()
    
    if not order:
        raise ProductNotFoundException(product_id=order_id)
    
    if order.payment_status != "paid":
        raise PaymentFailedException(reason="Cannot refund unpaid order")
    
    # Calculate refund amount (full refund if not specified)
    if refund_amount is None:
        refund_amount = order.total_amount
    
    if refund_amount > order.total_amount:
        raise PaymentFailedException(reason="Refund amount cannot exceed order total")
    
    # Process refund (mock implementation)
    refund_reference = f"refund_{str(uuid.uuid4()).replace('-', '')}"
    
    # Update order status
    order.payment_status = "refunded"
    order.status = "cancelled"
    
    # Restore stock quantities atomically
    stock_updates = {item.variant_id: item.quantity for item in order.items}

    if stock_updates: # Only update if there are items to update
        db.query(models.ProductVariant).filter(
            models.ProductVariant.id.in_(stock_updates.keys())
        ).update(
            {
                "stock_quantity": models.ProductVariant.stock_quantity +
                case(
                    stock_updates,
                    value=models.ProductVariant.id
                )
            },
            synchronize_session='fetch'
        )
    
    db.commit()
    
    return {
        "message": "Refund processed successfully",
        "order_id": order_id,
        "refund_amount": float(refund_amount),
        "refund_reference": refund_reference
    }
