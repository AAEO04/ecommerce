from fastapi import APIRouter, Request, HTTPException, Header, Depends
from starlette.responses import JSONResponse
import hmac
import hashlib
import json
from config import settings
from utils.payment import verify_payment
from sqlalchemy.orm import Session
from database import get_db
import models
import logging

router = APIRouter()

@router.post("/webhook/paystack")
async def paystack_webhook(request: Request, x_paystack_signature: str = Header(None), db: Session = Depends(get_db)):
    """
    Handles incoming Paystack webhook events.
    Verifies the signature to ensure the request is from Paystack.
    """
    if not x_paystack_signature:
        raise HTTPException(status_code=400, detail="X-Paystack-Signature header missing")

    payload = await request.body()
    
    try:
        hash_value = hmac.new(
            settings.PAYSTACK_SECRET_KEY.encode('utf-8'),
            payload,
            hashlib.sha512
        ).hexdigest()
        if hash_value != x_paystack_signature:
            raise HTTPException(status_code=400, detail="Invalid Paystack signature")
    except Exception as e:
        logging.error(f"Webhook signature verification failed: {e}")
        raise HTTPException(status_code=400, detail="Webhook signature verification failed")

    event = json.loads(payload.decode('utf-8'))
    
    if event['event'] == 'charge.success':
        reference = event['data']['reference']
        
        order = db.query(models.Order).filter(models.Order.payment_reference == reference).first()

        if not order:
            logging.error(f"Webhook received for unknown payment reference: {reference}")
            return JSONResponse(status_code=404, content={"message": "Order not found"})

        if order.payment_status == 'paid':
            logging.info(f"Webhook for already processed payment reference: {reference}")
            return JSONResponse(status_code=200, content={"message": "Webhook already processed"})

        verification_result = verify_payment(reference)
        if verification_result.get("verified"):
            order.payment_status = 'paid'
            order.status = 'confirmed'
            db.commit()
            logging.info(f"Payment for reference {reference} successfully verified and processed.")
        else:
            logging.error(f"Payment verification failed for reference {reference}: {verification_result.get('message')}")
            
    return JSONResponse(status_code=200, content={"message": "Webhook received"})