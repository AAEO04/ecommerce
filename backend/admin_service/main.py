# file: admin_service/main.py
import os
import uuid
from fastapi import FastAPI, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from typing import List, Optional
import requests
import redis

# Import shared models and schemas
from shared_models import models, schemas
from shared_models.database import SessionLocal, engine, get_db

# Redis configuration for cache invalidation
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))

try:
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)
    redis_client.ping()
except redis.ConnectionError:
    redis_client = None

# Product service URL for cache invalidation
PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:8001")

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Admin Service API",
    description="E-commerce admin service for product and order management",
    version="1.0.0"
)

def invalidate_product_cache(product_id: Optional[int] = None):
    """Invalidate product cache in Redis and notify product service"""
    try:
        if redis_client:
            if product_id:
                pattern = f"product:*product_id:{product_id}*"
            else:
                pattern = "product:*"
            
            keys = redis_client.keys(pattern)
            if keys:
                redis_client.delete(*keys)
        
        # Notify product service to invalidate cache
        if product_id:
            requests.post(f"{PRODUCT_SERVICE_URL}/cache/invalidate/{product_id}", timeout=5)
        else:
            requests.post(f"{PRODUCT_SERVICE_URL}/cache/invalidate", timeout=5)
    except Exception as e:
        print(f"Cache invalidation failed: {e}")

def generate_sku(product_name: str, size: str, color: Optional[str] = None) -> str:
    """Generate a unique SKU for a product variant"""
    base = product_name.replace(" ", "").upper()[:10]
    size_code = size.upper()[:3]
    color_code = (color.replace(" ", "").upper()[:3]) if color else "DEF"
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"{base}-{size_code}-{color_code}-{unique_id}"

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Admin Service API!",
        "version": "1.0.0",
        "redis_status": "connected" if redis_client else "disconnected"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    status = {"status": "healthy"}
    
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        status["database"] = "connected"
    except Exception as e:
        status["database"] = f"error: {str(e)}"
        status["status"] = "unhealthy"
    
    return status

# --- Product Management ---

@app.post("/admin/products/", response_model=schemas.ProductResponse, status_code=201)
def create_product(
    product: schemas.ProductCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create a new product with variants and images"""
    
    # Create the main product object
    db_product = models.Product(
        name=product.name,
        description=product.description,
        category=product.category
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    # Create product images
    for image_data in product.images:
        db_image = models.ProductImage(
            **image_data.dict(),
            product_id=db_product.id
        )
        db.add(db_image)

    # Create product variants
    for variant_data in product.variants:
        # Generate SKU if not provided
        sku = variant_data.sku or generate_sku(product.name, variant_data.size, variant_data.color)
        
        db_variant = models.ProductVariant(
            size=variant_data.size,
            color=variant_data.color,
            price=variant_data.price,
            stock_quantity=variant_data.stock_quantity,
            sku=sku,
            product_id=db_product.id
        )
        db.add(db_variant)

    db.commit()
    db.refresh(db_product)

    # Invalidate cache
    background_tasks.add_task(invalidate_product_cache, db_product.id)

    return db_product

@app.get("/admin/products/", response_model=List[schemas.ProductResponse])
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """List all products with filtering and pagination"""
    
    query = db.query(models.Product).options(
        joinedload(models.Product.variants),
        joinedload(models.Product.images)
    )
    
    # Apply filters
    if category:
        query = query.filter(models.Product.category == category)
    
    if is_active is not None:
        query = query.filter(models.Product.is_active == is_active)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Product.name.ilike(search_term),
                models.Product.description.ilike(search_term)
            )
        )
    
    products = query.offset(skip).limit(limit).all()
    return [schemas.ProductResponse.from_orm(product) for product in products]

@app.get("/admin/products/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    
    db_product = db.query(models.Product).options(
        joinedload(models.Product.variants),
        joinedload(models.Product.images)
    ).filter(models.Product.id == product_id).first()
    
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return schemas.ProductResponse.from_orm(db_product)

@app.put("/admin/products/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product_update: schemas.ProductUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Update a product"""
    
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update fields
    update_data = product_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    
    db.commit()
    db.refresh(db_product)
    
    # Invalidate cache
    background_tasks.add_task(invalidate_product_cache, product_id)
    
    return schemas.ProductResponse.from_orm(db_product)

@app.delete("/admin/products/{product_id}")
def delete_product(
    product_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Soft delete a product (set is_active to False)"""
    
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db_product.is_active = False
    db.commit()
    
    # Invalidate cache
    background_tasks.add_task(invalidate_product_cache, product_id)
    
    return {"message": "Product deleted successfully"}

# --- Variant Management ---

@app.post("/admin/products/{product_id}/variants/", response_model=schemas.ProductVariantResponse)
def create_variant(
    product_id: int,
    variant: schemas.ProductVariantCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create a new variant for a product"""
    
    # Check if product exists
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Generate SKU if not provided
    sku = variant.sku or generate_sku(db_product.name, variant.size, variant.color)
    
    db_variant = models.ProductVariant(
        **variant.dict(),
        sku=sku,
        product_id=product_id
    )
    db.add(db_variant)
    db.commit()
    db.refresh(db_variant)
    
    # Invalidate cache
    background_tasks.add_task(invalidate_product_cache, product_id)
    
    return schemas.ProductVariantResponse.from_orm(db_variant)

@app.put("/admin/variants/{variant_id}", response_model=schemas.ProductVariantResponse)
def update_variant(
    variant_id: int,
    variant_update: dict,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Update a product variant"""
    
    db_variant = db.query(models.ProductVariant).filter(
        models.ProductVariant.id == variant_id
    ).first()
    
    if db_variant is None:
        raise HTTPException(status_code=404, detail="Variant not found")
    
    # Update fields
    for field, value in variant_update.items():
        if hasattr(db_variant, field):
            setattr(db_variant, field, value)
    
    db.commit()
    db.refresh(db_variant)
    
    # Invalidate cache
    background_tasks.add_task(invalidate_product_cache, db_variant.product_id)
    
    return schemas.ProductVariantResponse.from_orm(db_variant)

@app.delete("/admin/variants/{variant_id}")
def delete_variant(
    variant_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Soft delete a variant"""
    
    db_variant = db.query(models.ProductVariant).filter(
        models.ProductVariant.id == variant_id
    ).first()
    
    if db_variant is None:
        raise HTTPException(status_code=404, detail="Variant not found")
    
    db_variant.is_active = False
    db.commit()
    
    # Invalidate cache
    background_tasks.add_task(invalidate_product_cache, db_variant.product_id)
    
    return {"message": "Variant deleted successfully"}

# --- Order Management ---

@app.get("/admin/orders/", response_model=List[schemas.OrderResponse])
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List all orders with filtering"""
    
    query = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.variant)
    )
    
    if status:
        query = query.filter(models.Order.status == status)
    
    if payment_status:
        query = query.filter(models.Order.payment_status == payment_status)
    
    orders = query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()
    return [schemas.OrderResponse.from_orm(order) for order in orders]

@app.get("/admin/orders/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a specific order by ID"""
    
    db_order = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.variant)
    ).filter(models.Order.id == order_id).first()
    
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return schemas.OrderResponse.from_orm(db_order)

@app.put("/admin/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status_update: dict,
    db: Session = Depends(get_db)
):
    """Update order status"""
    
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update status
    if "status" in status_update:
        db_order.status = status_update["status"]
    
    if "payment_status" in status_update:
        db_order.payment_status = status_update["payment_status"]
    
    if "notes" in status_update:
        db_order.notes = status_update["notes"]
    
    db.commit()
    
    return {"message": "Order status updated successfully", "order_id": order_id}

# --- Category Management ---

@app.post("/admin/categories/", response_model=schemas.CategoryResponse)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category"""
    
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    return schemas.CategoryResponse.from_orm(db_category)

@app.get("/admin/categories/", response_model=List[schemas.CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    """List all categories"""
    
    categories = db.query(models.Category).all()
    return [schemas.CategoryResponse.from_orm(category) for category in categories]