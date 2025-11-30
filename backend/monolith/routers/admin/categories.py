from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
import re

import models
import schemas
from database import get_db
from utils import auth

router = APIRouter(prefix="/categories", tags=["Admin Categories"])

def generate_slug(name: str) -> str:
    """Generate URL-friendly slug from category name"""
    slug = name.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug

@router.get("/", response_model=List[schemas.CategoryResponse])
def get_admin_categories(
    current_admin: dict = Depends(auth.get_current_admin_from_cookie),
    include_inactive: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Get all categories"""
    query = db.query(models.Category)

    if not include_inactive:
        query = query.filter(models.Category.is_active == True)

    categories = query.order_by(models.Category.name).all()
    return [schemas.CategoryResponse.from_orm(category) for category in categories]

@router.get("/{category_id}", response_model=schemas.CategoryResponse)
def get_category(
    category_id: int,
    current_admin: dict = Depends(auth.get_current_admin_from_cookie),
    db: Session = Depends(get_db)
):
    """Get a single category by ID"""
    category = db.query(models.Category).filter(
        models.Category.id == category_id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return schemas.CategoryResponse.from_orm(category)

@router.post("/", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: schemas.CategoryCreate,
    current_admin: dict = Depends(auth.get_current_admin_from_cookie),
    db: Session = Depends(get_db)
):
    """Create a new category"""
    # Generate slug if not provided
    slug = category_data.slug or generate_slug(category_data.name)
    
    # Check if category with same name or slug exists
    existing = db.query(models.Category).filter(
        (models.Category.name == category_data.name) | 
        (models.Category.slug == slug)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name or slug already exists"
        )
    
    # Validate parent_id if provided
    if category_data.parent_id:
        parent = db.query(models.Category).filter(
            models.Category.id == category_data.parent_id
        ).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent category not found"
            )
    
    try:
        new_category = models.Category(
            name=category_data.name,
            slug=slug,
            description=category_data.description,
            image_url=category_data.image_url,
            parent_id=category_data.parent_id,
            is_active=True
        )
        db.add(new_category)
        db.commit()
        db.refresh(new_category)
        return schemas.CategoryResponse.from_orm(new_category)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create category due to database constraint"
        )

@router.put("/{category_id}", response_model=schemas.CategoryResponse)
def update_category(
    category_id: int,
    category_data: schemas.CategoryUpdate,
    current_admin: dict = Depends(auth.get_current_admin_from_cookie),
    db: Session = Depends(get_db)
):
    """Update an existing category"""
    category = db.query(models.Category).filter(
        models.Category.id == category_id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check for name/slug conflicts with other categories
    if category_data.name or category_data.slug:
        check_name = category_data.name or category.name
        check_slug = category_data.slug or category.slug
        
        existing = db.query(models.Category).filter(
            models.Category.id != category_id,
            (models.Category.name == check_name) | 
            (models.Category.slug == check_slug)
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another category with this name or slug already exists"
            )
    
    # Validate parent_id if being updated
    if category_data.parent_id is not None:
        if category_data.parent_id == category_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category cannot be its own parent"
            )
        if category_data.parent_id > 0:
            parent = db.query(models.Category).filter(
                models.Category.id == category_data.parent_id
            ).first()
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent category not found"
                )
    
    try:
        # Update fields
        if category_data.name is not None:
            category.name = category_data.name
        if category_data.slug is not None:
            category.slug = category_data.slug
        if category_data.description is not None:
            category.description = category_data.description
        if category_data.image_url is not None:
            category.image_url = category_data.image_url
        if category_data.parent_id is not None:
            category.parent_id = category_data.parent_id if category_data.parent_id > 0 else None
        if category_data.is_active is not None:
            category.is_active = category_data.is_active
        
        db.commit()
        db.refresh(category)
        return schemas.CategoryResponse.from_orm(category)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update category due to database constraint"
        )

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    current_admin: dict = Depends(auth.get_current_admin_from_cookie),
    db: Session = Depends(get_db)
):
    """Delete a category (soft delete by setting is_active=False)"""
    category = db.query(models.Category).filter(
        models.Category.id == category_id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if category has products
    products_count = db.query(models.Product).filter(
        models.Product.category == category.slug
    ).count()
    
    if products_count > 0:
        # Soft delete - just deactivate
        category.is_active = False
        db.commit()
    else:
        # Hard delete if no products
        db.delete(category)
        db.commit()
    
    return None