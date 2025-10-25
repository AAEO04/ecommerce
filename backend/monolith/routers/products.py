# file: routers/products.py
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List, Optional
from decimal import Decimal

import models
import schemas
from database import get_db
from utils.cache import get_cache_key, get_from_cache, set_cache, invalidate_cache

router = APIRouter()

@router.get("/", response_model=List[schemas.ProductResponse])
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
    
    # Try cache first
    cached_data = get_from_cache(cache_key)
    if cached_data:
        return cached_data
    
    # Build query
    query = db.query(models.Product).options(
        joinedload(models.Product.variants),
        joinedload(models.Product.images)
    ).filter(models.Product.is_active == True)
    
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
        query = query.join(models.ProductVariant)
        
        if min_price is not None:
            query = query.filter(models.ProductVariant.price >= min_price)
        
        if max_price is not None:
            query = query.filter(models.ProductVariant.price <= max_price)
        
        if in_stock_only:
            query = query.filter(models.ProductVariant.stock_quantity > 0)
        
        query = query.distinct()
    
    products = query.offset(skip).limit(limit).all()
    result = [schemas.ProductResponse.from_orm(product) for product in products]
    
    # Cache result
    set_cache(cache_key, [product.dict() for product in result])
    
    return result

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    
    cache_key = get_cache_key("product", product_id=product_id)
    cached_data = get_from_cache(cache_key)
    if cached_data:
        return cached_data
    
    db_product = db.query(models.Product).options(
        joinedload(models.Product.variants),
        joinedload(models.Product.images)
    ).filter(
        models.Product.id == product_id,
        models.Product.is_active == True
    ).first()
    
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    result = schemas.ProductResponse.from_orm(db_product)
    set_cache(cache_key, result.dict(), expire=3600)
    
    return result

@router.get("/{product_id}/variants", response_model=List[schemas.ProductVariantResponse])
def get_product_variants(
    product_id: int,
    in_stock_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Get all variants for a specific product"""
    
    product = db.query(models.Product).filter(
        models.Product.id == product_id,
        models.Product.is_active == True
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    query = db.query(models.ProductVariant).filter(
        models.ProductVariant.product_id == product_id,
        models.ProductVariant.is_active == True
    )
    
    if in_stock_only:
        query = query.filter(models.ProductVariant.stock_quantity > 0)
    
    variants = query.all()
    return [schemas.ProductVariantResponse.from_orm(variant) for variant in variants]

@router.post("/cache/invalidate")
def invalidate_product_cache(background_tasks: BackgroundTasks):
    """Invalidate all product caches"""
    background_tasks.add_task(invalidate_cache)
    return {"message": "Cache invalidation started"}

@router.post("/cache/invalidate/{product_id}")
def invalidate_specific_cache(product_id: int, background_tasks: BackgroundTasks):
    """Invalidate cache for a specific product"""
    background_tasks.add_task(invalidate_cache, product_id)
    return {"message": f"Cache invalidation started for product {product_id}"}

