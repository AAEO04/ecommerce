from fastapi import APIRouter, Request, HTTPException, Header
from starlette.responses import JSONResponse
import hmac
import hashlib
import json
from config import settings
from utils.payment import verify_payment

router = APIRouter()

@router.post("/webhook/paystack")
async def paystack_webhook(request: Request, x_paystack_signature: str = Header(None)):
    """
    Handles incoming Paystack webhook events.
    Verifies the signature to ensure the request is from Paystack.
    """
    if not x_paystack_signature:
        raise HTTPException(status_code=400, detail="X-Paystack-Signature header missing")

    payload = await request.body()
    
    # Verify webhook signature
    # Paystack sends the raw request body, so we need to hash that
    # and compare it with the signature in the header.
    # The secret key is used to sign the payload.
    try:
        hash_value = hmac.new(
            settings.PAYSTACK_SECRET_KEY.encode('utf-8'),
            payload,
            hashlib.sha512
        ).hexdigest()
        if hash_value != x_paystack_signature:
            raise HTTPException(status_code=400, detail="Invalid Paystack signature")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook signature verification failed: {e}")

    event = json.loads(payload.decode('utf-8'))
    
    # Process the event
    if event['event'] == 'charge.success':
        reference = event['data']['reference']
        # Here, you would typically update your order status in the database
        # and handle idempotency.
        # For now, we'll just verify the payment.
        verification_result = verify_payment(reference)
        if verification_result.get("verified"):
            print(f"Payment for reference {reference} successfully verified and processed.")
            # TODO: Implement idempotency check:
            # 1. Query your database for an order or payment record using the 'reference'.
            # 2. If a record exists and is already marked as 'successful', ignore this webhook to prevent double processing.
            # 3. If the record exists but is pending, update its status to 'successful'.
            # 4. If no record exists (e.g., due to a race condition or out-of-order events), you might need to create one or log for manual review.
            # 5. Ensure all database operations are atomic.
            # Example: update_order_status(reference, 'completed')
        else:
            print(f"Payment verification failed for reference {reference}: {verification_result.get('message')}")
            # TODO: Log this failure and potentially trigger a manual review
    
    return JSONResponse(status_code=200, content={"message": "Webhook received"})
