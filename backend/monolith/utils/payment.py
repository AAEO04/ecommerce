# file: utils/payment.py
import requests
import json
from decimal import Decimal
from typing import Dict, Any, Optional
from config import settings

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
        amount_kobo = int(amount * 100)  # Convert to kobo

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
        amount_kobo = int(amount * 100)

        payload = {
            "amount": amount_kobo,
            "recipient": recipient_code,
            "reference": reference,
            "currency": "NGN"
        }

        if reason:
            payload["reason"] = reason

        return self._make_request("POST", "/transfer", payload)

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
            print(f"Mock payment processed: {email} - NGN{amount} - Ref: {reference}")
            return {
                "status": "success",
                "reference": reference,
                "amount": float(amount) * 100,  # Paystack uses kobo
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
                "amount": int(amount * 100),
                "authorization_url": data.get("authorization_url"),
                "access_code": data.get("access_code"),
                "message": "Payment initialized successfully"
            }
        else:
            return {
                "status": "failed",
                "message": response.get("message", "Payment initialization failed")
            }

    except Exception as e:
        return {
            "status": "failed",
            "message": f"Payment processing failed: {str(e)}"
        }

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
                "amount": 100000,  # Mock amount in kobo
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
                "reference": data.get("reference"),
                "amount": data.get("amount"),
                "currency": data.get("currency", "NGN"),
                "payment_date": data.get("paid_at"),
                "channel": data.get("channel"),
                "customer": data.get("customer", {}),
                "message": "Payment verified successfully"
            }
        else:
            return {
                "status": "failed",
                "verified": False,
                "message": response.get("message", "Payment verification failed")
            }

    except Exception as e:
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
        print(f"Failed to fetch banks: {e}")
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

