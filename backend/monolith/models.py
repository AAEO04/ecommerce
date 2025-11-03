# file: models.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Numeric, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from utils.constants import ADMIN_ROLE, PRODUCT_NAME_MAX_LENGTH, CATEGORY_NAME_MAX_LENGTH, VARIANT_SIZE_MAX_LENGTH, VARIANT_COLOR_MAX_LENGTH, VARIANT_SKU_MAX_LENGTH, IMAGE_URL_MAX_LENGTH, IMAGE_ALT_TEXT_MAX_LENGTH, ORDER_NUMBER_MAX_LENGTH, ORDER_STATUS_MAX_LENGTH, PAYMENT_STATUS_MAX_LENGTH, PAYMENT_REFERENCE_MAX_LENGTH, CUSTOMER_EMAIL_MAX_LENGTH, CUSTOMER_PHONE_MAX_LENGTH, USERNAME_MAX_LENGTH, PASSWORD_HASH_MAX_LENGTH, ROLE_MAX_LENGTH, IDEMPOTENCY_KEY_MAX_LENGTH, PAYMENT_METHOD_MAX_LENGTH, NAME_MAX_LENGTH

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(PRODUCT_NAME_MAX_LENGTH), nullable=False, index=True)
    description = Column(Text)
    category = Column(String(CATEGORY_NAME_MAX_LENGTH), ForeignKey("categories.slug"), index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")

class ProductVariant(Base):
    __tablename__ = "productvariants"

    id = Column(Integer, primary_key=True, index=True)
    size = Column(String(VARIANT_SIZE_MAX_LENGTH), nullable=False)
    color = Column(String(VARIANT_COLOR_MAX_LENGTH))
    stock_quantity = Column(Integer, nullable=False, default=0)
    price = Column(Numeric(10, 2), nullable=False)
    sku = Column(String(VARIANT_SKU_MAX_LENGTH), unique=True, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

    product = relationship("Product", back_populates="variants")

class ProductImage(Base):
    __tablename__ = "productimages"

    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String(IMAGE_URL_MAX_LENGTH), nullable=False)
    alt_text = Column(String(IMAGE_ALT_TEXT_MAX_LENGTH))
    display_order = Column(Integer, default=0)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

    product = relationship("Product", back_populates="images")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(ORDER_NUMBER_MAX_LENGTH), unique=True, index=True)
    idempotency_key = Column(String(IDEMPOTENCY_KEY_MAX_LENGTH), unique=True, nullable=True, index=True)
    status = Column(String(ORDER_STATUS_MAX_LENGTH), default="pending")
    payment_status = Column(String(PAYMENT_STATUS_MAX_LENGTH), default="pending")
    payment_method = Column(String(PAYMENT_METHOD_MAX_LENGTH))
    payment_reference = Column(String(PAYMENT_REFERENCE_MAX_LENGTH))
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    customer = relationship("Customer")
    shipping_address = Column(Text, nullable=False)
    billing_address = Column(Text)
    total_amount = Column(Numeric(10, 2), nullable=False)
    shipping_cost = Column(Numeric(10, 2), default=0)
    tax_amount = Column(Numeric(10, 2), default=0)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "orderitems"

    id = Column(Integer, primary_key=True, index=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    variant_id = Column(Integer, ForeignKey("productvariants.id"), nullable=False)

    order = relationship("Order", back_populates="items")
    variant = relationship("ProductVariant")

# Additional models for enhanced functionality

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(CATEGORY_NAME_MAX_LENGTH), nullable=False, unique=True)
    slug = Column(String(CATEGORY_NAME_MAX_LENGTH), nullable=False, unique=True, index=True)
    description = Column(Text)
    parent_id = Column(Integer, ForeignKey("categories.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    parent = relationship("Category", remote_side=[id])
    children = relationship("Category", back_populates="parent")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(CUSTOMER_EMAIL_MAX_LENGTH), unique=True, index=True)
    phone = Column(String(CUSTOMER_PHONE_MAX_LENGTH))
    first_name = Column(String(NAME_MAX_LENGTH))
    last_name = Column(String(NAME_MAX_LENGTH))
    date_of_birth = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(USERNAME_MAX_LENGTH), unique=True, nullable=False, index=True)
    hashed_password = Column(String(PASSWORD_HASH_MAX_LENGTH), nullable=False)
    role = Column(String(ROLE_MAX_LENGTH), default=ADMIN_ROLE, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
