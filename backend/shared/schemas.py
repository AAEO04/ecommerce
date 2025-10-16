# file: backend/shared/schemas.py
from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

# --- Product Schemas ---

class ProductImageResponse(BaseModel):
    id: int
    image_url: str
    alt_text: Optional[str] = None
    display_order: int
    is_primary: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProductVariantResponse(BaseModel):
    id: int
    size: str
    color: Optional[str] = None
    price: Decimal
    stock_quantity: int
    sku: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    images: List[ProductImageResponse] = []
    variants: List[ProductVariantResponse] = []

    class Config:
        from_attributes = True

class ProductVariantCreate(BaseModel):
    size: str
    color: Optional[str] = None
    price: Decimal
    stock_quantity: int = 0
    sku: Optional[str] = None

    @validator('price')
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Price must be positive')
        return v

    @validator('stock_quantity')
    def stock_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError('Stock quantity cannot be negative')
        return v

class ProductImageCreate(BaseModel):
    image_url: str
    alt_text: Optional[str] = None
    display_order: int = 0
    is_primary: bool = False

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    images: List[ProductImageCreate] = []
    variants: List[ProductVariantCreate]

    @validator('variants')
    def must_have_variants(cls, v):
        if not v:
            raise ValueError('Product must have at least one variant')
        return v

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

# --- Order Schemas ---

class OrderItemResponse(BaseModel):
    id: int
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    variant_id: int
    variant: Optional[ProductVariantResponse] = None

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_number: str
    status: str
    payment_status: str
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    billing_address: Optional[str] = None
    total_amount: Decimal
    shipping_cost: Decimal
    tax_amount: Decimal
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    variant_id: int
    quantity: int

    @validator('quantity')
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be positive')
        return v

class CheckoutRequest(BaseModel):
    cart: List[OrderItemCreate]
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    shipping_address: str
    billing_address: Optional[str] = None
    payment_method: str = "card"
    notes: Optional[str] = None

    @validator('cart')
    def cart_must_not_be_empty(cls, v):
        if not v:
            raise ValueError('Cart cannot be empty')
        return v

class PaymentRequest(BaseModel):
    order_id: int
    payment_method: str
    payment_reference: Optional[str] = None

# --- Category Schemas ---

class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[int] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[int] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None
    is_active: Optional[bool] = None

# --- Customer Schemas ---

class CustomerResponse(BaseModel):
    id: int
    email: str
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CustomerCreate(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None

class CustomerUpdate(BaseModel):
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    is_active: Optional[bool] = None

# Legacy schemas for backward compatibility
Product = ProductResponse
ProductVariant = ProductVariantResponse
ProductImage = ProductImageResponse
Order = OrderResponse
OrderItem = OrderItemResponse