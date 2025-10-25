# file: main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from routers import products, admin, orders, notifications, auth
from database import engine, SessionLocal
import models
from config import settings
from utils.rate_limiting import limiter, rate_limit_handler

# Try to create all database tables (will fail gracefully if DB is not available)
try:
    models.Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified successfully")
except Exception as e:
    print(f"⚠️  Database connection failed: {e}")
    print("Note: The API will start but database operations will fail until DB is available")

app = FastAPI(
    title="MAD RUSH E-commerce API",
    description="Monolithic API for MAD RUSH e-commerce platform",
    version="2.0.0"
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # Only allow configured origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
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
        db.execute("SELECT 1")
        db.close()
        status["services"]["database"] = "connected"
    except Exception as e:
        status["services"]["database"] = f"error: {str(e)}"
        status["status"] = "unhealthy"
    
    # Check Redis (optional)
    if redis_client:
        try:
            redis_client.ping()
            status["services"]["redis"] = "connected"
        except Exception as e:
            status["services"]["redis"] = f"error: {str(e)}"
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

