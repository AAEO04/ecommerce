# file: routers/admin.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, case
from datetime import datetime, timedelta
from typing import List, Optional
from decimal import Decimal

import models
import schemas
from database import get_db
from utils.auth import get_current_admin_user

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
async def get_dashboard_stats(
    range: str = Query("30d", regex="^(7d|30d|90d)$"),
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_admin_user)
):
    """Get dashboard statistics for the specified time range"""
    
    # Calculate date range
    days = int(range[:-1])
    start_date = datetime.now() - timedelta(days=days)
    previous_start = start_date - timedelta(days=days)
    
    # Current period stats
    current_orders = db.query(models.Order).filter(
        models.Order.created_at >= start_date,
        models.Order.payment_status == "completed"
    ).all()
    
    # Previous period stats for comparison
    previous_orders = db.query(models.Order).filter(
        models.Order.created_at >= previous_start,
        models.Order.created_at < start_date,
        models.Order.payment_status == "completed"
    ).all()
    
    # Calculate metrics
    current_revenue = sum(float(order.total_amount) for order in current_orders)
    previous_revenue = sum(float(order.total_amount) for order in previous_orders)
    revenue_change = ((current_revenue - previous_revenue) / previous_revenue * 100) if previous_revenue > 0 else 0
    
    current_order_count = len(current_orders)
    previous_order_count = len(previous_orders)
    orders_change = ((current_order_count - previous_order_count) / previous_order_count * 100) if previous_order_count > 0 else 0
    
    # Customer stats
    current_customers = db.query(func.count(func.distinct(models.Customer.id))).filter(
        models.Customer.created_at >= start_date
    ).scalar()
    
    previous_customers = db.query(func.count(func.distinct(models.Customer.id))).filter(
        models.Customer.created_at >= previous_start,
        models.Customer.created_at < start_date
    ).scalar()
    
    customers_change = ((current_customers - previous_customers) / previous_customers * 100) if previous_customers > 0 else 0
    
    # Conversion rate (orders / unique visitors - simplified)
    total_customers = db.query(func.count(models.Customer.id)).scalar()
    conversion_rate = (current_order_count / total_customers * 100) if total_customers > 0 else 0
    
    return {
        "totalRevenue": round(current_revenue, 2),
        "revenueChange": round(revenue_change, 1),
        "totalOrders": current_order_count,
        "ordersChange": round(orders_change, 1),
        "totalCustomers": current_customers,
        "customersChange": round(customers_change, 1),
        "conversionRate": round(conversion_rate, 1),
        "conversionChange": 0  # Placeholder
    }

@router.get("/sales")
async def get_sales_data(
    range: str = Query("30d", regex="^(7d|30d|90d)$"),
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_admin_user)
):
    """Get sales data for charts"""
    
    days = int(range[:-1])
    start_date = datetime.now() - timedelta(days=days)
    
    # Group by date
    sales_by_date = db.query(
        func.date(models.Order.created_at).label('date'),
        func.sum(models.Order.total_amount).label('revenue'),
        func.count(models.Order.id).label('orders')
    ).filter(
        models.Order.created_at >= start_date,
        models.Order.payment_status == "completed"
    ).group_by(
        func.date(models.Order.created_at)
    ).order_by('date').all()
    
    return [
        {
            "date": sale.date.strftime("%b %d"),
            "revenue": float(sale.revenue or 0),
            "orders": sale.orders
        }
        for sale in sales_by_date
    ]

@router.get("/top-products")
async def get_top_products(
    range: str = Query("30d", regex="^(7d|30d|90d)$"),
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_admin_user)
):
    """Get top selling products"""
    
    days = int(range[:-1])
    start_date = datetime.now() - timedelta(days=days)
    
    # Query top products by revenue
    top_products = db.query(
        models.Product.id,
        models.Product.name,
        models.Product.category,
        func.sum(models.OrderItem.total_price).label('revenue'),
        func.sum(models.OrderItem.quantity).label('units_sold'),
        func.sum(models.ProductVariant.stock_quantity).label('stock')
    ).join(
        models.ProductVariant, models.Product.id == models.ProductVariant.product_id
    ).join(
        models.OrderItem, models.ProductVariant.id == models.OrderItem.variant_id
    ).join(
        models.Order, models.OrderItem.order_id == models.Order.id
    ).filter(
        models.Order.created_at >= start_date,
        models.Order.payment_status == "completed"
    ).group_by(
        models.Product.id,
        models.Product.name,
        models.Product.category
    ).order_by(
        desc('revenue')
    ).limit(limit).all()
    
    return [
        {
            "id": product.id,
            "name": product.name,
            "category": product.category or "Uncategorized",
            "revenue": float(product.revenue or 0),
            "unitsSold": product.units_sold or 0,
            "stock": product.stock or 0
        }
        for product in top_products
    ]

@router.get("/inventory-alerts")
async def get_inventory_alerts(
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_admin_user)
):
    """Get low stock inventory alerts"""
    
    # Define thresholds
    CRITICAL_THRESHOLD = 5
    LOW_THRESHOLD = 10
    WARNING_THRESHOLD = 20
    
    low_stock_variants = db.query(
        models.ProductVariant.id,
        models.Product.name.label('product_name'),
        models.ProductVariant.sku,
        models.ProductVariant.stock_quantity
    ).join(
        models.Product, models.ProductVariant.product_id == models.Product.id
    ).filter(
        models.ProductVariant.stock_quantity <= WARNING_THRESHOLD,
        models.ProductVariant.is_active == True,
        models.Product.is_active == True
    ).order_by(
        models.ProductVariant.stock_quantity
    ).all()
    
    alerts = []
    for variant in low_stock_variants:
        if variant.stock_quantity <= CRITICAL_THRESHOLD:
            status = "critical"
            min_stock = CRITICAL_THRESHOLD
        elif variant.stock_quantity <= LOW_THRESHOLD:
            status = "low"
            min_stock = LOW_THRESHOLD
        else:
            status = "warning"
            min_stock = WARNING_THRESHOLD
            
        alerts.append({
            "id": variant.id,
            "productName": variant.product_name,
            "variantSku": variant.sku,
            "currentStock": variant.stock_quantity,
            "minStock": min_stock,
            "status": status
        })
    
    return alerts

@router.get("/customer-analytics")
async def get_customer_analytics(
    range: str = Query("30d", regex="^(7d|30d|90d)$"),
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_admin_user)
):
    """Get customer analytics data"""
    
    days = int(range[:-1])
    start_date = datetime.now() - timedelta(days=days)
    
    # New vs returning customers
    total_customers = db.query(func.count(models.Customer.id)).filter(
        models.Customer.created_at >= start_date
    ).scalar()
    
    # Average order value
    avg_order_value = db.query(
        func.avg(models.Order.total_amount)
    ).filter(
        models.Order.created_at >= start_date,
        models.Order.payment_status == "completed"
    ).scalar()
    
    # Customer lifetime value (simplified)
    customer_ltv = db.query(
        func.avg(func.sum(models.Order.total_amount))
    ).join(
        models.Customer, models.Order.customer_id == models.Customer.id
    ).filter(
        models.Order.payment_status == "completed"
    ).group_by(
        models.Customer.id
    ).scalar()
    
    return {
        "newCustomers": total_customers,
        "averageOrderValue": float(avg_order_value or 0),
        "customerLifetimeValue": float(customer_ltv or 0),
        "repeatCustomerRate": 0  # Placeholder - requires more complex query
    }

@router.get("/revenue-by-category")
async def get_revenue_by_category(
    range: str = Query("30d", regex="^(7d|30d|90d)$"),
    db: Session = Depends(get_db),
    current_user: models.AdminUser = Depends(get_current_admin_user)
):
    """Get revenue breakdown by product category"""
    
    days = int(range[:-1])
    start_date = datetime.now() - timedelta(days=days)
    
    category_revenue = db.query(
        models.Product.category,
        func.sum(models.OrderItem.total_price).label('revenue'),
        func.count(models.OrderItem.id).label('orders')
    ).join(
        models.ProductVariant, models.Product.id == models.ProductVariant.product_id
    ).join(
        models.OrderItem, models.ProductVariant.id == models.OrderItem.variant_id
    ).join(
        models.Order, models.OrderItem.order_id == models.Order.id
    ).filter(
        models.Order.created_at >= start_date,
        models.Order.payment_status == "completed"
    ).group_by(
        models.Product.category
    ).all()
    
    return [
        {
            "category": cat.category or "Uncategorized",
            "revenue": float(cat.revenue or 0),
            "orders": cat.orders
        }
        for cat in category_revenue
    ]
