import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List, Optional
from decimal import Decimal

import models
import schemas
from database import get_db
from utils import auth
from utils.cache import invalidate_cache

router = APIRouter(prefix="/products", tags=["Admin Products"])

def generate_sku(product_name: str, size: str, color: Optional[str] = None) -> str:
    """Generate a unique SKU for a product variant"""
    base = product_name.replace(" ", "").upper()[:10]
    size_code = size.upper()[:3]
    color_code = (color.replace(" ", "").upper()[:3]) if color else "DEF"
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"{base}-{size_code}-{color_code}-{unique_id}"

@router.get("/", response_model=List[schemas.ProductResponse])
def admin_get_products(
    current_admin: dict = Depends(auth.get_current_admin_from_cookie),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Get all products (including inactive) with search"""

    query = db.query(models.Product).options(
        joinedload(models.Product.variants),
        joinedload(models.Product.images)
    )

    if not include_inactive:
        query = query.filter(models.Product.is_active == True)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Product.name.ilike(search_term),
                models.Product.description.ilike(search_term),
                models.Product.category.ilike(search_term)
            )
        )

    if category:
        query = query.filter(models.Product.category == category)

    products = query.order_by(models.Product.created_at.desc()).offset(skip).limit(limit).all()
    return [schemas.ProductResponse.from_orm(product) for product in products]

@router.post("/", response_model=schemas.ProductResponse)
def create_product(
    product_data: schemas.ProductCreate,
    background_tasks: BackgroundTasks,
    current_admin: dict = Depends(auth.get_current_admin_from_cookie),
    db: Session = Depends(get_db)
):
    """Create a new product with variants and images"""

    # Create the product
    new_product = models.Product(
        name=product_data.name,
        description=product_data.description,
        category=product_data.category
    )
    db.add(new_product)
    db.flush()

    # Create variants
    for variant_data in product_data.variants:
        sku = generate_sku(product_data.name, variant_data.size, variant_data.color)
        variant = models.ProductVariant(
            product_id=new_product.id,
            size=variant_data.size,
            color=variant_data.color,
            price=variant_data.price,
            stock_quantity=variant_data.stock_quantity,
            sku=sku
        )
        db.add(variant)

    # Create images
    for image_data in product_data.images:
        image = models.ProductImage(
            product_id=new_product.id,
            image_url=str(image_data.image_url),
            alt_text=image_data.alt_text,
            display_order=image_data.display_order,
            is_primary=image_data.is_primary
        )
        db.add(image)

    db.commit()
    db.refresh(new_product)

    # Invalidate cache
    background_tasks.add_task(invalidate_cache)

    return schemas.ProductResponse.from_orm(new_product)

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product_data: schemas.ProductUpdate,
    background_tasks: BackgroundTasks,
    current_admin: dict = Depends(auth.get_current_admin_from_cookie),
    db: Session = Depends(get_db)
):
    """Update a product"""

    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Update fields
    if product_data.name is not None:
        product.name = product_data.name
    if product_data.description is not None:
        product.description = product_data.description
    if product_data.category is not None:
        product.category = product_data.category
    if product_data.is_active is not None:
        product.is_active = product_data.is_active

    db.commit()
    db.refresh(product)

    # Invalidate cache
    background_tasks.add_task(invalidate_cache, product_id)

    return schemas.ProductResponse.from_orm(product)

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    background_tasks: BackgroundTasks,
    current_admin: dict = Depends(auth.get_current_admin_from_cookie),
    db: Session = Depends(get_db)
):
    """Delete a product (soft delete by setting is_active=False)"""

    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_active = False
    db.commit()

    # Invalidate cache
    background_tasks.add_task(invalidate_cache, product_id)

    return {"message": "Product deleted successfully"}