# file: main.py
import logging
from fastapi import FastAPI, Response, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from routers import products, admin, orders, notifications, auth, admin_management, payment_routes, payment_webhook, payment_verification
from database import SessionLocal
from config import settings
from utils.rate_limiting import limiter, rate_limit_handler

import os
import traceback
from sqlalchemy import text

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MAD RUSH E-commerce API",
    description="Monolithic API for MAD RUSH e-commerce platform",
    version="2.0.0"
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

# Global exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions"""
    logger.error(f"Unhandled exception: {exc}")
    logger.error(traceback.format_exc())
    
    # Don't leak stack traces in production
    if settings.ENVIRONMENT == "production":
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "Internal server error",
                "error_id": str(id(exc))  # For tracking
            }
        )
    else:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": str(exc),
                "type": type(exc).__name__,
                "traceback": traceback.format_exc().split('\n')
            }
        )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with better formatting"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors()
        }
    )

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # Only allow configured origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# GZip middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Mount static files


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin_management.router, prefix="/api/admin-management", tags=["Admin Management"])
app.include_router(payment_routes.router, prefix="/api/payment", tags=["Payment"])
app.include_router(payment_webhook.router, prefix="/api/payment", tags=["Payment Webhook"])
app.include_router(payment_verification.router, prefix="/api/payment", tags=["Payment Verification"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])

@app.get("/")
def read_root():
    return {
        "message": "MAD RUSH E-commerce API",
        "version": "2.0.0",
        "status": "running",
        "architecture": "monolithic",
        "description": "Unified backend for customer store and admin panel"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    from utils.cache import redis_client
    
    status = {"status": "healthy", "services": {}}
    
    # Check database
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        status["services"]["database"] = "connected"
    except Exception as e:
        logging.error(f"Health check: Database connection failed: {e}")
        status["services"]["database"] = "error"
        status["status"] = "unhealthy"
    
    # Check Redis (optional)
    if redis_client:
        try:
            redis_client.ping()
            status["services"]["redis"] = "connected"
        except Exception as e:
            logging.error(f"Health check: Redis connection failed: {e}")
            status["services"]["redis"] = "error"
    else:
        status["services"]["redis"] = "not configured"
    
    return status

@app.get("/api")
def api_info():
    """API information and available endpoints"""
    return {
        "name": "MAD RUSH E-commerce API",
        "version": "2.0.0",
        "endpoints": {
            "products": "/api/products",
            "admin": "/api/admin",
            "orders": "/api/orders",
            "notifications": "/api/notifications"
        },
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

