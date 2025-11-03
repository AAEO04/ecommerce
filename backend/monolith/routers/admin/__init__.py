from fastapi import APIRouter
from . import dashboard, products, orders, categories

router = APIRouter(prefix="/admin")
router.include_router(dashboard.router)
router.include_router(products.router)
router.include_router(orders.router)
router.include_router(categories.router)