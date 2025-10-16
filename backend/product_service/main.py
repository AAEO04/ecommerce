# file: main.py
import os
import redis
import json
from fastapi import FastAPI, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from typing import List, Optional
from decimal import Decimal

# Import shared models and schemas
from shared_models import models, schemas
from shared_models.database import SessionLocal, engine, get_db

# Redis configuration
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))

try:
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)
    redis_client.ping()  # Test connection
except redis.ConnectionError:
    redis_client = None
    print("Warning: Redis not available, caching disabled")

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Product Service API",
    description="E-commerce product catalog service with caching",
    version="1.0.0"
)

def get_cache_key(prefix: str, **kwargs) -> str:
    """Generate cache key from prefix and parameters"""
    params = "_".join([f"{k}:{v}" for k, v in sorted(kwargs.items())])
    return f"{prefix}:{params}"

def get_from_cache(key: str) -> Optional[dict]:
    """Get data from Redis cache"""
    if not redis_client:
        return None
    try:
        data = redis_client.get(key)
        return json.loads(data) if data else None
    except (json.JSONDecodeError, redis.RedisError):
        return None

def set_cache(key: str, data: dict, expire: int = 3600) -> None:
    """Set data in Redis cache with expiration"""
    if not redis_client:
        return
    try:
        redis_client.setex(key, expire, json.dumps(data, default=str))
    except redis.RedisError:
        pass

def invalidate_product_cache(product_id: Optional[int] = None):
    """Invalidate product-related cache entries"""
    if not redis_client:
        return
    try:
        if product_id:
            # Invalidate specific product cache
            pattern = f"product:*product_id:{product_id}*"
        else:
            # Invalidate all product caches
            pattern = "product:*"
        
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
    except redis.RedisError:
        pass

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Product Service API!",
        "version": "1.0.0",
        "redis_status": "connected" if redis_client else "disconnected"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    status = {"status": "healthy"}
    
    # Check database connection
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        status["database"] = "connected"
    except Exception as e:
        status["database"] = f"error: {str(e)}"
        status["status"] = "unhealthy"
    
    # Check Redis connection
    if redis_client:
        try:
            redis_client.ping()
            status["redis"] = "connected"
        except Exception as e:
            status["redis"] = f"error: {str(e)}"
    else:
        status["redis"] = "not configured"
    
    return status

@app.get("/products/", response_model=List[schemas.ProductResponse])
def read_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_price: Optional[Decimal] = Query(None, ge=0),
    max_price: Optional[Decimal] = Query(None, ge=0),
    in_stock_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Get products with filtering, search, and pagination"""
    
    # Generate cache key
    cache_key = get_cache_key(
        "products",
        skip=skip,
        limit=limit,
        category=category or "all",
        search=search or "none",
        min_price=str(min_price) if min_price else "none",
        max_price=str(max_price) if max_price else "none",
        in_stock_only=in_stock_only
    )
    
    # Try to get from cache first
    cached_data = get_from_cache(cache_key)
    if cached_data:
        return cached_data
    
    # Build query
    query = db.query(models.Product).options(
        joinedload(models.Product.variants),
        joinedload(models.Product.images)
    ).filter(models.Product.is_active == True)
    
    # Apply filters
    if category:
        query = query.filter(models.Product.category == category)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Product.name.ilike(search_term),
                models.Product.description.ilike(search_term)
            )
        )
    
    if min_price is not None or max_price is not None or in_stock_only:
        # Need to join with variants for price and stock filtering
        query = query.join(models.ProductVariant)
        
        if min_price is not None:
            query = query.filter(models.ProductVariant.price >= min_price)
        
        if max_price is not None:
            query = query.filter(models.ProductVariant.price <= max_price)
        
        if in_stock_only:
            query = query.filter(models.ProductVariant.stock_quantity > 0)
        
        # Ensure we don't get duplicate products
        query = query.distinct()
    
    # Apply pagination
    products = query.offset(skip).limit(limit).all()
    
    # Convert to response format
    result = [schemas.ProductResponse.from_orm(product) for product in products]
    
    # Cache the result
    set_cache(cache_key, [product.dict() for product in result])
    
    return result

@app.get("/products/{product_id}", response_model=schemas.ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID with caching"""
    
    # Generate cache key
    cache_key = get_cache_key("product", product_id=product_id)
    
    # Try to get from cache first
    cached_data = get_from_cache(cache_key)
    if cached_data:
        return cached_data
    
    # Query database
    db_product = db.query(models.Product).options(
        joinedload(models.Product.variants),
        joinedload(models.Product.images)
    ).filter(
        models.Product.id == product_id,
        models.Product.is_active == True
    ).first()
    
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Convert to response format
    result = schemas.ProductResponse.from_orm(db_product)
    
    # Cache the result for 1 hour
    set_cache(cache_key, result.dict(), expire=3600)
    
    return result

@app.get("/products/{product_id}/variants", response_model=List[schemas.ProductVariantResponse])
def get_product_variants(
    product_id: int,
    in_stock_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Get all variants for a specific product"""
    
    # Check if product exists
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.is_active == True
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Query variants
    query = db.query(models.ProductVariant).filter(
        models.ProductVariant.product_id == product_id,
        models.ProductVariant.is_active == True
    )
    
    if in_stock_only:
        query = query.filter(models.ProductVariant.stock_quantity > 0)
    
    variants = query.all()
    return [schemas.ProductVariantResponse.from_orm(variant) for variant in variants]

@app.get("/categories/", response_model=List[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Get all active categories"""
    
    categories = db.query(models.Category).filter(
        models.Category.is_active == True
    ).all()
    
    return [schemas.CategoryResponse.from_orm(category) for category in categories]

@app.post("/cache/invalidate")
def invalidate_cache(background_tasks: BackgroundTasks):
    """Invalidate all product caches"""
    background_tasks.add_task(invalidate_product_cache)
    return {"message": "Cache invalidation started"}

@app.post("/cache/invalidate/{product_id}")
def invalidate_product_cache_endpoint(product_id: int, background_tasks: BackgroundTasks):
    """Invalidate cache for a specific product"""
    background_tasks.add_task(invalidate_product_cache, product_id)
    return {"message": f"Cache invalidation started for product {product_id}"}
