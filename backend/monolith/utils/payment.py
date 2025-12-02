import requests
import json
import hmac
import hashlib
import logging
from decimal import Decimal
from typing import Dict, Any, Optional
from config import settings
from utils import constants

logger = logging.getLogger(__name__)

class PaystackClient:
    """Paystack payment gateway client"""

    BASE_URL = "https://api.paystack.co"

    def __init__(self):
        self.secret_key = settings.PAYSTACK_SECRET_KEY
        self.public_key = settings.PAYSTACK_PUBLIC_KEY

    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Make HTTP request to Paystack API"""
        if not self.secret_key:
            raise ValueError("Paystack secret key not configured")

        url = f"{self.BASE_URL}{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }

        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            raise Exception(f"Paystack API request failed: {str(e)}")

    def initialize_payment(self, amount: Decimal, email: str, reference: str,
                          callback_url: str = None, metadata: Dict = None) -> Dict[str, Any]:
        """
        Initialize a payment transaction

        Args:
            amount: Amount in Naira (will be converted to kobo)
            email: Customer email address
            reference: Unique payment reference
            callback_url: URL to redirect to after payment
            metadata: Additional payment metadata

        Returns:
            Dict containing payment initialization response
        """
        amount_kobo = int(amount * constants.PAYSTACK_KOBO_MULTIPLIER)  # Convert to kobo

        payload = {
            "amount": amount_kobo,
            "email": email,
            "reference": reference,
            "currency": "NGN"
        }

        if callback_url:
            payload["callback_url"] = callback_url

        if metadata:
            payload["metadata"] = metadata

        return self._make_request("POST", "/transaction/initialize", payload)

    def verify_payment(self, reference: str) -> Dict[str, Any]:
        """
        Verify a payment transaction

        Args:
            reference: Payment reference to verify

        Returns:
            Dict containing payment verification response
        """
        return self._make_request("GET", f"/transaction/verify/{reference}")

    def get_payment_details(self, payment_id: str) -> Dict[str, Any]:
        """
        Get payment details by ID

        Args:
            payment_id: Paystack payment ID

        Returns:
            Dict containing payment details
        """
        return self._make_request("GET", f"/transaction/{payment_id}")

    def list_banks(self, country: str = "nigeria", use_cursor: bool = False,
                   per_page: int = 50, next_cursor: str = None) -> Dict[str, Any]:
        """
        List available banks for bank transfers

        Args:
            country: Country code (default: nigeria)
            use_cursor: Use cursor pagination
            per_page: Number of banks per page
            next_cursor: Next cursor for pagination

        Returns:
            Dict containing list of banks
        """
        params = {"country": country, "perPage": per_page}
        if use_cursor and next_cursor:
            params["next"] = next_cursor

        endpoint = "/bank"
        if use_cursor:
            endpoint += "?use_cursor=true"

        return self._make_request("GET", endpoint)

    def create_transfer_recipient(self, name: str, account_number: str,
                                bank_code: str, description: str = None) -> Dict[str, Any]:
        """
        Create a transfer recipient

        Args:
            name: Recipient name
            account_number: Bank account number
            bank_code: Bank code
            description: Optional description

        Returns:
            Dict containing transfer recipient details
        """
        payload = {
            "type": "nuban",
            "name": name,
            "account_number": account_number,
            "bank_code": bank_code
        }

        if description:
            payload["description"] = description

        return self._make_request("POST", "/transferrecipient", payload)

    def initiate_transfer(self, amount: Decimal, recipient_code: str,
                         reference: str, reason: str = None) -> Dict[str, Any]:
        """
        Initiate a transfer to a recipient

        Args:
            amount: Transfer amount in Naira
            recipient_code: Recipient code from create_transfer_recipient
            reference: Unique transfer reference
            reason: Transfer reason

        Returns:
            Dict containing transfer details
        """
        amount_kobo = int(amount * constants.PAYSTACK_KOBO_MULTIPLIER)

        payload = {
            "amount": amount_kobo,
            "recipient": recipient_code,
            "reference": reference,
            "currency": "NGN"
        }

        if reason:
            payload["reason"] = reason

        return self._make_request("POST", "/transfer", payload)

    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """
        Verify Paystack webhook signature
        
        Args:
            payload: Raw request body as bytes
            signature: X-Paystack-Signature header value
            
        Returns:
            True if signature is valid, False otherwise
        """
        try:
            computed_signature = hmac.new(
                self.secret_key.encode('utf-8'),
                payload,
                hashlib.sha512
            ).hexdigest()
            
            is_valid = hmac.compare_digest(computed_signature, signature)
            
            if is_valid:
                logger.info("Webhook signature verified successfully")
            else:
                logger.warning("Invalid webhook signature")
            
            return is_valid
            
        except Exception as e:
            logger.error(f"Error verifying webhook signature: {str(e)}")
            return False
    
    def process_webhook_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process Paystack webhook event
        
        Args:
            event_data: Webhook event data
            
        Returns:
            Dict containing processing result
        """
        event_type = event_data.get("event")
        data = event_data.get("data", {})
        
        logger.info(f"Processing webhook event: {event_type}")
        
        if event_type == "charge.success":
            return self._handle_charge_success(data)
        elif event_type == "charge.failed":
            return self._handle_charge_failed(data)
        elif event_type == "transfer.success":
            return self._handle_transfer_success(data)
        elif event_type == "transfer.failed":
            return self._handle_transfer_failed(data)
        else:
            logger.warning(f"Unhandled webhook event type: {event_type}")
            return {
                "status": True,
                "message": f"Event {event_type} received but not processed"
            }
    
    def _handle_charge_success(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle successful charge webhook"""
        reference = data.get("reference")
        amount = data.get("amount")
        customer_email = data.get("customer", {}).get("email")
        
        logger.info(f"Charge success: {reference} - Amount: {amount} - Customer: {customer_email}")
        
        return {
            "status": True,
            "message": "Charge success event processed",
            "reference": reference,
            "amount": amount,
            "customer_email": customer_email
        }
    
    def _handle_charge_failed(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle failed charge webhook"""
        reference = data.get("reference")
        logger.warning(f"Charge failed: {reference}")
        
        return {
            "status": True,
            "message": "Charge failed event processed",
            "reference": reference
        }
    
    def _handle_transfer_success(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle successful transfer webhook"""
        reference = data.get("reference")
        logger.info(f"Transfer success: {reference}")
        
        return {
            "status": True,
            "message": "Transfer success event processed",
            "reference": reference
        }
    
    def _handle_transfer_failed(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle failed transfer webhook"""
        reference = data.get("reference")
        logger.warning(f"Transfer failed: {reference}")
        
        return {
            "status": True,
            "message": "Transfer failed event processed",
            "reference": reference
        }

# Global Paystack client instance
paystack_client = PaystackClient()

def process_payment(amount: Decimal, email: str, reference: str,
                   callback_url: str = None, metadata: Dict = None) -> dict:
    """
    Process payment via Paystack

    Args:
        amount: Amount in Naira
        email: Customer email
        reference: Unique payment reference
        callback_url: Optional callback URL
        metadata: Optional payment metadata

    Returns:
        Dict containing payment result
    """
    try:
        if settings.PAYMENT_MODE == "mock":
            # Mock payment for development
            logger.info(f"Mock payment processed: {email} - NGN{amount} - Ref: {reference}")
            return {
                "status": "success",
                "reference": reference,
                "amount": float(amount) * constants.PAYSTACK_KOBO_MULTIPLIER,  # Paystack uses kobo
                "message": "Payment processed successfully (mock mode)",
                "authorization_url": f"https://checkout.paystack.com/{reference}",
                "access_code": f"access_{reference}"
            }

        if not settings.PAYSTACK_SECRET_KEY:
            raise ValueError("Paystack secret key not configured for production mode")

        response = paystack_client.initialize_payment(
            amount=amount,
            email=email,
            reference=reference,
            callback_url=callback_url,
            metadata=metadata
        )

        if response.get("status"):
            data = response.get("data", {})
            return {
                "status": "success",
                "reference": reference,
                "amount": int(amount * constants.PAYSTACK_KOBO_MULTIPLIER),
                "authorization_url": data.get("authorization_url"),
                "access_code": data.get("access_code"),
                "message": "Payment initialized successfully"
            }
        else:
            logger.error(f"Payment initialization failed: {response.get('message')}")
            return {
                "status": "failed",
                "message": response.get("message", "Payment initialization failed")
            }

    except Exception as e:
        logger.error(f"Payment processing error: {str(e)}")
        return {
            "status": "failed",
            "message": f"Payment processing failed: {str(e)}"
        }

# IMPORTANT: Be cautious about logging sensitive payment data. Avoid logging raw card details,
# full customer payment information, or API keys. Log only necessary information for debugging
# and auditing, such as references, masked amounts, and general status.
def verify_payment(reference: str) -> dict:
    """
    Verify Paystack payment

    Args:
        reference: Payment reference to verify

    Returns:
        Dict containing verification result
    """
    try:
        if settings.PAYMENT_MODE == "mock":
            return {
                "status": "success",
                "verified": True,
                "message": "Payment verification (mock mode)",
                "amount": constants.PAYSTACK_MIN_AMOUNT,  # Mock amount in kobo
                "currency": "NGN",
                "payment_date": "2024-01-01T00:00:00.000000Z",
                "channel": "card"
            }

        if not settings.PAYSTACK_SECRET_KEY:
            raise ValueError("Paystack secret key not configured for production mode")

        response = paystack_client.verify_payment(reference)

        if response.get("status"):
            data = response.get("data", {})
            return {
                "status": "success",
                "verified": True,
                "message": "Payment verified successfully",
                "data": {
                    "reference": data.get("reference"),
                    "amount": data.get("amount"),
                    "currency": data.get("currency", "NGN"),
                    "paid_at": data.get("paid_at"),
                    "channel": data.get("channel"),
                    "customer": data.get("customer", {}),
                    "status": data.get("status")
                }
            }
        else:
            logger.error(f"Payment verification failed: {response.get('message')}")
            return {
                "status": "failed",
                "verified": False,
                "message": response.get("message", "Payment verification failed")
            }

    except Exception as e:
        logger.error(f"Verification error: {str(e)}")
        return {
            "status": "failed",
            "verified": False,
            "message": f"Verification failed: {str(e)}"
        }

def get_supported_banks() -> list:
    """
    Get list of supported banks in Nigeria

    Returns:
        List of bank objects with code, name, and other details
    """
    try:
        response = paystack_client.list_banks()
        if response.get("status"):
            return response.get("data", [])
        return []
    except Exception as e:
        logger.error(f"Failed to fetch banks: {e}")
        return []

def create_bank_recipient(name: str, account_number: str, bank_code: str) -> dict:
    """
    Create a transfer recipient for bank transfers

    Returns:
        Dict containing recipient details or error
    """
    try:
        response = paystack_client.create_transfer_recipient(
            name=name,
            account_number=account_number,
            bank_code=bank_code
        )

        if response.get("status"):
            return {
                "status": "success",
                "recipient_code": response.get("data", {}).get("recipient_code"),
                "message": "Recipient created successfully"
            }
        else:
            return {
                "status": "failed",
                "message": response.get("message", "Failed to create recipient")
            }

    except Exception as e:
        return {
            "status": "failed",
            "message": f"Failed to create recipient: {str(e)}"
        }

