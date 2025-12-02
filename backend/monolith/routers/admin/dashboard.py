from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func
from typing import List, Optional
from decimal import Decimal

import models
import schemas
from database import get_db
from utils import auth

router = APIRouter(prefix="/dashboard", tags=["Admin Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    current_admin: dict = Depends(auth.get_current_admin_from_cookie),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for admin panel"""

    # Get total products count
    total_products = db.query(models.Product).filter(
        models.Product.is_active == True
    ).count()

    # Get total orders count
    total_orders = db.query(models.Order).count()

    # Get total customers count (unique emails from orders)
    total_customers = db.query(models.Customer).filter(
        models.Customer.is_active == True
    ).count()

    # If no customers in customer table, count unique customer emails from orders
    if total_customers == 0:
        total_customers = db.query(models.Order.customer_email).distinct().count()

    # Calculate total revenue from completed orders
    revenue_result = db.query(
        sql_func.sum(models.Order.total_amount)
    ).filter(
        models.Order.payment_status == "paid"
    ).scalar()

    total_revenue = float(revenue_result) if revenue_result else 0.0

    # Get recent orders (last 5)
    recent_orders = db.query(models.Order).order_by(
        models.Order.created_at.desc()
    ).limit(5).all()

    # Format recent orders for response
    formatted_orders = []
    for order in recent_orders:
        formatted_orders.append({
            "id": f"#{order.order_number}",
            "customer": order.customer_name,
            "amount": f"₦{float(order.total_amount):.2f}",
            "status": order.status
        })

    return {
        "totalProducts": total_products,
        "totalOrders": total_orders,
        "totalCustomers": total_customers,
        "revenue": total_revenue,
        "recentOrders": formatted_orders
    }