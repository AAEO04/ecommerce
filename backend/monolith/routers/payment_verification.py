# file: routers/payment_verification.py
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
from database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/verify/{reference}")
async def verify_payment_status(reference: str, db: Session = Depends(get_db)):
    """
    Verify payment status and return order information if payment was successful.
    This is called by the frontend after Paystack redirect.
    """
    try:
        # Find the order by payment reference
        order = db.query(models.Order).filter(
            models.Order.payment_reference == reference
        ).first()
        
        if order:
            # Order exists, payment was successful
            return {
                "status": "success",
                "message": "Payment verified successfully",
                "order_number": order.order_number,
                "order_id": order.id,
                "payment_status": order.payment_status
            }
        
        # Check if pending checkout exists
        pending = db.query(models.PendingCheckout).filter(
            models.PendingCheckout.payment_reference == reference
        ).first()
        
        if pending:
            if pending.status == "completed":
                # Find the order
                order = db.query(models.Order).filter(
                    models.Order.payment_reference == reference
                ).first()
                if order:
                    return {
                        "status": "success",
                        "message": "Payment verified successfully",
                        "order_number": order.order_number,
                        "order_id": order.id,
                        "payment_status": order.payment_status
                    }
            elif pending.status == "pending":
                return {
                    "status": "pending",
                    "message": "Payment is being processed. Please wait..."
                }
            elif pending.status == "failed":
                return {
                    "status": "failed",
                    "message": "Payment failed. Please try again."
                }
        
        # No order or pending checkout found
        return {
            "status": "not_found",
            "message": "Payment reference not found"
        }
    
    except Exception as e:
        logger.exception("Error verifying payment")
        raise HTTPException(status_code=500, detail=str(e))
