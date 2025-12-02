"""
Payment Routes
Handles payment initialization, verification, and callbacks
"""
from fastapi import APIRouter, HTTPException, status, Depends, Request, Response
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from database import get_db
from models import Order, Payment
from models import Order, Payment
from utils.payment import paystack_client, process_payment, verify_payment as verify_payment_util
from utils.rate_limiting import limiter
from config import settings
from datetime import datetime
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class InitializePaymentRequest(BaseModel):
    email: EmailStr
    amount: int  # Amount in kobo (₦100 = 10000 kobo)
    order_id: int
    callback_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class InitializePaymentResponse(BaseModel):
    status: bool
    message: str
    authorization_url: Optional[str] = None
    access_code: Optional[str] = None
    reference: Optional[str] = None


class VerifyPaymentResponse(BaseModel):
    status: bool
    message: str
    data: Optional[Dict[str, Any]] = None


# ============================================================================
# PAYMENT ENDPOINTS
# ============================================================================

@router.post("/initialize", response_model=InitializePaymentResponse)
async def initialize_payment(
    request: InitializePaymentRequest,
    db: Session = Depends(get_db)
):
    """
    Initialize a Paystack payment transaction
    
    This endpoint should be called from your frontend after order creation.
    It returns an authorization URL and access code for Paystack Popup.
    """
    try:
        # Verify order exists
        order = db.query(Order).filter(Order.id == request.order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Check if order is already paid
        if order.payment_status == "paid":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order is already paid"
            )
        
        # Verify amount matches order total
        order_amount_kobo = int(order.total_amount * 100)  # Convert to kobo
        if request.amount != order_amount_kobo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Amount mismatch. Expected {order_amount_kobo} kobo, got {request.amount} kobo"
            )
        
        # Generate unique reference
        reference = f"MADRUSH-{order.id}-{uuid.uuid4().hex[:8].upper()}"
        
        # IDEMPOTENCY CHECK: Prevent duplicate payment initialization
        existing_payment = db.query(Payment).filter(
            Payment.order_id == order.id,
            Payment.status.in_(["pending", "success"])
        ).first()
        
        if existing_payment:
            logger.info(f"Payment already exists for order {order.id}: {existing_payment.reference}")
            # Return existing payment data instead of creating duplicate
            return InitializePaymentResponse(
                status=True,
                message="Payment already initialized",
                data={
                    "authorization_url": existing_payment.authorization_url or "",
                    "access_code": existing_payment.access_code or "",
                    "reference": existing_payment.reference
                }
            )
        
        # Set callback URL
        callback_url = request.callback_url or f"{settings.FRONTEND_URL}/payment/callback"
        
        # Prepare metadata
        metadata = request.metadata or {}
        metadata.update({
            "order_id": order.id,
            "customer_name": order.customer_name,
            "customer_phone": order.customer_phone,
            "cancel_action": f"{settings.FRONTEND_URL}/orders/{order.id}"
        })
        
        # Initialize transaction with Paystack
        result = process_payment(
            email=request.email,
            amount=request.amount / 100,  # Convert kobo to naira for the utility function
            reference=reference,
            callback_url=callback_url,
            metadata=metadata
        )
        
        if result["status"]:
            # Create payment record
            payment = Payment(
                order_id=order.id,
                reference=reference,
                amount=order.total_amount,
                status="pending",
                payment_method="paystack",
                created_at=datetime.utcnow()
            )
            db.add(payment)
            
            # Update order
            order.payment_reference = reference
            order.payment_status = "pending"
            
            db.commit()
            
            logger.info(f"Payment initialized for order {order.id}: {reference}")
            
            return InitializePaymentResponse(
                status=True,
                message="Payment initialized successfully",
                authorization_url=result["authorization_url"],
                access_code=result["access_code"],
                reference=result["reference"]
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result["message"]
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error initializing payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize payment: {str(e)}"
        )


@router.get("/verify/{reference}", response_model=VerifyPaymentResponse)
@limiter.limit("60/minute")
async def verify_payment(
    reference: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Verify a Paystack payment transaction
    
    This endpoint should be called after payment to confirm the transaction status.
    Always verify before delivering value to the customer.
    """
    try:
        # Verify with Paystack
        result = verify_payment_util(reference)
        
        if not result.get("status"):
            return VerifyPaymentResponse(
                status=False,
                message=result.get("message", "Payment verification failed")
            )
        
        # The utility function returns { "status": "success", "data": { ... } }
        # So we need to access result["data"] to get the transaction details
        transaction_data = result.get("data", {})
        
        # If transaction_data is empty but status is success, something is wrong
        if not transaction_data and result.get("status") == "success":
             # Fallback: maybe the result IS the data (in mock mode or different return structure)
             if "amount" in result:
                 transaction_data = result
             else:
                 logger.error(f"Verification result missing data for {reference}: {result}")
                 return VerifyPaymentResponse(
                     status=False,
                     message="Payment verification failed: Invalid response structure"
                 )
        
        # Find payment record
        payment = db.query(Payment).filter(
            Payment.reference == reference
        ).first()
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment record not found"
            )
        
        # Find order
        order = db.query(Order).filter(Order.id == payment.order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Verify amount matches
        expected_amount_kobo = int(payment.amount * 100)
        actual_amount = transaction_data["amount"]
        
        if expected_amount_kobo != actual_amount:
            logger.error(
                f"Amount mismatch for {reference}: "
                f"Expected {expected_amount_kobo}, got {actual_amount}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment amount mismatch"
            )
        
        # Update payment record
        payment.status = transaction_data["status"]
        payment.paid_at = datetime.fromisoformat(
            transaction_data["paid_at"].replace("Z", "+00:00")
        ) if transaction_data.get("paid_at") else None
        payment.channel = transaction_data.get("channel")
        payment.fees = transaction_data.get("fees", 0) / 100  # Convert from kobo
        import json
        payment.payment_metadata = json.dumps(transaction_data.get("metadata", {}))
        
        # Update order status
        if transaction_data["status"] == "success":
            order.payment_status = "paid"
            order.status = "processing"
            logger.info(f"Payment successful for order {order.id}: {reference}")
        else:
            order.payment_status = "failed"
            logger.warning(f"Payment failed for order {order.id}: {reference}")
        
        db.commit()
        
        return VerifyPaymentResponse(
            status=True,
            message="Payment verified successfully",
            data={
                "reference": reference,
                "amount": transaction_data["amount"] / 100,  # Convert to naira
                "status": transaction_data["status"],
                "paid_at": transaction_data.get("paid_at"),
                "customer_email": transaction_data["customer"]["email"],
                "order_id": order.id,
                "order_status": order.status
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify payment: {str(e)}"
        )


@router.get("/callback")
async def payment_callback(
    reference: str,
    trxref: str = None
):
    """
    Payment callback endpoint
    
    Paystack redirects here after payment.
    This endpoint redirects to the frontend payment verification page.
    """
    try:
        # Use trxref if reference is not provided
        payment_ref = reference or trxref
        
        # Redirect to frontend callback page with reference
        from fastapi.responses import RedirectResponse
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/payment/callback?reference={payment_ref}",
            status_code=302
        )
        
    except Exception as e:
        logger.error(f"Error in payment callback: {str(e)}")
        from fastapi.responses import RedirectResponse
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/payment/callback?error=true",
            status_code=302
        )


@router.post("/webhook")
async def payment_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Paystack webhook endpoint
    
    Receives webhook events from Paystack (e.g., charge.success).
    Verifies signature and processes the event.
    """
    try:
        # Get raw body for signature verification
        body = await request.body()
        
        # Get signature from header
        signature = request.headers.get("x-paystack-signature")
        
        if not signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing signature header"
            )
        
        # Verify signature
        if not paystack_client.verify_webhook_signature(body, signature):
            logger.warning("Invalid webhook signature")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid signature"
            )
        
        # Parse event data
        event_data = await request.json()
        
        # Process event
        result = paystack_client.process_webhook_event(event_data)
        
        # Handle charge.success event
        if event_data.get("event") == "charge.success":
            reference = result.get("reference")
            
            if reference:
                # Find and update payment
                payment = db.query(Payment).filter(
                    Payment.reference == reference
                ).first()
                
                if payment:
                    payment.status = "success"
                    payment.paid_at = datetime.utcnow()
                    
                    # Update order
                    order = db.query(Order).filter(
                        Order.id == payment.order_id
                    ).first()
                    
                    if order:
                        order.payment_status = "paid"
                        order.status = "processing"
                    
                    db.commit()
                    
                    logger.info(f"Webhook processed: Payment confirmed for {reference}")
        
        return {"status": "success", "message": "Webhook processed"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
