"""
Mock Paystack Service
This is a mock implementation for development purposes.
Replace with actual Paystack API calls in production.
"""
import hmac
import hashlib
import os
from typing import Dict, Any, Tuple

class PaystackService:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key

    def initialize_transaction(self, email: str, amount: int, reference: str, callback_url: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Mocks Paystack's initialize transaction endpoint."""
        # In a real implementation, you would make an API call to Paystack here.
        # For now, we'll just return a mock response.
        return {
            "status": True,
            "message": "Authorization URL created",
            "data": {
                "authorization_url": f"https://checkout.paystack.com/mock/{reference}",
                "access_code": f"mock_access_code_{reference}",
                "reference": reference,
            },
        }

    def verify_transaction(self, reference: str) -> Dict[str, Any]:
        """Mocks Paystack's verify transaction endpoint."""
        # In a real implementation, you would make an API call to Paystack here.
        # For now, we'll just return a mock success response.
        return {
            "status": True,
            "message": "Verification successful",
            "data": {
                "status": "success",
                "reference": reference,
                "amount": 10000,  # Mock amount in kobo
                "paid_at": "2023-10-27T10:30:00.000Z",
                "channel": "card",
                "fees": 100,
                "metadata": {},
                "customer": {
                    "email": "test@example.com"
                }
            },
        }

    def verify_webhook_signature(self, body: bytes, signature: str) -> bool:
        """Mocks Paystack's webhook signature verification."""
        # In a real implementation, you would use the secret key to verify the signature.
        # For now, we'll just return True for any signature.
        return True

    def process_webhook_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Mocks Paystack's webhook event processing."""
        # In a real implementation, you would process the event data here.
        # For now, we'll just return a mock response.
        return {
            "status": "success",
            "reference": event_data.get("data", {}).get("reference")
        }

# You would get this from your environment variables in a real application
PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY", "your_mock_secret_key")

paystack_service = PaystackService(secret_key=PAYSTACK_SECRET_KEY)
