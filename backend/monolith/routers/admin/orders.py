from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List, Optional
from decimal import Decimal

import models
import schemas
from database import get_db
from utils import auth

router = APIRouter(prefix="/orders", tags=["Admin Orders"])

@router.get("/")
def admin_get_orders(
    current_admin: dict = Depends(auth.get_current_admin_from_cookie),
    status: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: Session = Depends(get_db)
):
    """Get all orders with filtering"""

    query = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.variant)
    )

    if status and status != 'all':
        query = query.filter(models.Order.status == status)

    if payment_status and payment_status != 'all':
        query = query.filter(models.Order.payment_status == payment_status)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Order.order_number.ilike(search_term),
                models.Order.customer_name.ilike(search_term),
                models.Order.customer_email.ilike(search_term)
            )
        )

    orders = query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()
    return [schemas.OrderResponse.from_orm(order) for order in orders]

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def admin_get_order(
    order_id: int,
    current_admin: dict = Depends(auth.get_current_admin_from_cookie),
    db: Session = Depends(get_db)
):
    """Get order details by ID"""

    order = db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.variant).joinedload(models.ProductVariant.product)
    ).filter(models.Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return schemas.OrderResponse.from_orm(order)

@router.put("/{order_id}/status")
def update_order_status(
    order_id: int,
    updates: dict,
    current_admin: dict = Depends(auth.get_current_admin_from_cookie),
    db: Session = Depends(get_db)
):
    """Update order status"""

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Update status fields
    if "status" in updates:
        order.status = updates["status"]

    if "payment_status" in updates:
        order.payment_status = updates["payment_status"]

    if "notes" in updates:
        order.notes = updates["notes"]

    db.commit()

    return {"message": "Order status updated successfully", "order_id": order_id}