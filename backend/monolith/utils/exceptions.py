from fastapi import HTTPException

class BusinessException(HTTPException):
    """Base class for business logic exceptions"""
    def __init__(self, detail: str, status_code: int = 400):
        super().__init__(status_code=status_code, detail=detail)

class ProductNotFoundException(BusinessException):
    def __init__(self, product_id: int):
        super().__init__(f"Product {product_id} not found", status_code=404)

class InsufficientStockException(BusinessException):
    def __init__(self, variant_id: int, available: int, requested: int):
        super().__init__(
            f"Insufficient stock for variant {variant_id}. "
            f"Available: {available}, Requested: {requested}",
            status_code=400
        )

class PaymentFailedException(BusinessException):
    def __init__(self, reason: str):
        super().__init__(f"Payment failed: {reason}", status_code=402)