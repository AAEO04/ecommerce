
import unittest
from unittest.mock import patch, MagicMock
import os
import sys
from decimal import Decimal

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import get_db
import models

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency override for tests
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

class TestCheckoutFlow(unittest.TestCase):

    def setUp(self):
        models.Base.metadata.create_all(bind=engine)
        self.db = TestingSessionLocal()

    def tearDown(self):
        self.db.close()
        models.Base.metadata.drop_all(bind=engine)

    @patch('utils.notifications.send_email')
    @patch('utils.payment.process_payment')
    def test_checkout_success_sends_email(self, mock_process_payment, mock_send_email):
        # Mock payment processing to always succeed
        mock_process_payment.return_value = {"status": "success"}
        mock_send_email.return_value = True

        # Create a test product and variant
        product = models.Product(name="Test Product", description="A product for testing", category_id=None)
        self.db.add(product)
        self.db.commit()

        variant = models.ProductVariant(
            product_id=product.id,
            size="M",
            color="Black",
            stock_quantity=10,
            price=Decimal("100.00")
        )
        self.db.add(variant)
        self.db.commit()

        # Simulate a checkout request
        checkout_data = {
            "customer_name": "Test User",
            "customer_email": "test@example.com",
            "customer_phone": "1234567890",
            "shipping_address": "123 Test St",
            "payment_method": "card",
            "cart": [
                {
                    "variant_id": variant.id,
                    "quantity": 2
                }
            ]
        }

        response = client.post("/checkout", json=checkout_data)

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Order placed successfully!")

        # Verify email was sent
        mock_send_email.assert_called_once()
        
        # Verify stock was updated
        updated_variant = self.db.query(models.ProductVariant).filter_by(id=variant.id).one()
        self.assertEqual(updated_variant.stock_quantity, 8)

        # Verify order was created
        order = self.db.query(models.Order).filter_by(customer_email="test@example.com").one()
        self.assertIsNotNone(order)
        self.assertEqual(order.total_amount, Decimal("200.00"))

if __name__ == "__main__":
    unittest.main()
