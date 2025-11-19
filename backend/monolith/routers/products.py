# file: routers/products.py
import json

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, desc
from typing import List, Optional
from decimal import Decimal
from datetime import datetime, timedelta

import models
import schemas
from database import get_db
from utils.rate_limiting import limiter
from utils.cache import redis_client, get_cache_key, get_from_cache, set_cache, invalidate_cache
from utils.cache_decorator import cached
from utils import constants

router = APIRouter()

@router.get("/categories", response_model=List[schemas.CategoryResponse])
@limiter.limit("30/minute")
def get_categories(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get all active categories for customer store (public endpoint)"""
    # Try to get from cache first
    cache_key = "categories:active"
    if redis_client:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                categories_data = json.loads(cached)
                return [schemas.CategoryResponse(**cat) for cat in categories_data]
        except Exception as e:
            # Cache miss or error, continue to database
            pass
    
    # Fetch from database
    categories = db.query(models.Category).filter(
        models.Category.is_active == True
    ).order_by(models.Category.name).all()
    
    result = [schemas.CategoryResponse.from_orm(cat) for cat in categories]
    
    # Cache for 5 minutes
    if redis_client:
        try:
            categories_dict = [cat.dict() for cat in result]
            redis_client.setex(cache_key, 300, json.dumps(categories_dict, default=str))
        except Exception as e:
            # Cache write failed, but we still have the data
            pass
    
    return result

@router.get("/", response_model=List[schemas.ProductResponse])
@cached("products", expire=constants.CACHE_PRODUCT_TTL)
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
    return products


@router.get("/best-sellers", response_model=List[schemas.BestSellerProduct])
@cached("best_sellers", expire=constants.CACHE_PRODUCT_TTL // 2)
def get_best_sellers(
    range: str = Query("30d", regex="^(7d|30d|90d)$"),
    limit: int = Query(6, ge=1, le=12),
    db: Session = Depends(get_db)
):
    """Public endpoint that surfaces the top-selling products for the storefront."""

    days = int(range[:-1])
    start_date = datetime.now() - timedelta(days=days)

    sales_cte = (
        db.query(
            models.Product.id.label("product_id"),
            func.sum(models.OrderItem.quantity).label("units_sold"),
            func.sum(models.OrderItem.total_price).label("revenue"),
        )
        .join(models.ProductVariant, models.ProductVariant.product_id == models.Product.id)
        .join(models.OrderItem, models.OrderItem.variant_id == models.ProductVariant.id)
        .join(models.Order, models.Order.id == models.OrderItem.order_id)
        .filter(
            models.Order.payment_status == "completed",
            models.Order.created_at >= start_date,
            models.Product.is_active == True,
        )
        .group_by(models.Product.id)
        .order_by(desc("revenue"))
        .limit(limit)
        .cte("best_sellers")
    )

    products = (
        db.query(models.Product, sales_cte.c.units_sold, sales_cte.c.revenue)
        .join(sales_cte, models.Product.id == sales_cte.c.product_id)
        .options(
            joinedload(models.Product.variants),
            joinedload(models.Product.images),
        )
        .order_by(desc(sales_cte.c.revenue))
        .all()
    )

    best_sellers: List[schemas.BestSellerProduct] = []
    for product, units_sold, revenue in products:
        best_sellers.append(
            schemas.BestSellerProduct(
                product=schemas.ProductResponse.from_orm(product),
                unitsSold=int(units_sold or 0),
                revenue=float(revenue or 0),
            )
        )

    return best_sellers

@router.get("/{product_id}", response_model=schemas.ProductResponse)
@cached("product", expire=constants.CACHE_PRODUCT_TTL, key_builder=lambda product_id, **kwargs: f"product:{product_id}")
def read_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    
    db_product = db.query(models.Product).options(
        joinedload(models.Product.variants),
        joinedload(models.Product.images)
    ).filter(
        models.Product.id == product_id,
        models.Product.is_active == True
    ).first()
    
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return db_product

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

