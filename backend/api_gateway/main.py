# file: api_gateway/main.py
import os
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
import redis
from typing import Optional
import time

# Service URLs
PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://product_service:8001")
ADMIN_SERVICE_URL = os.getenv("ADMIN_SERVICE_URL", "http://admin_service:8002")
ORDER_SERVICE_URL = os.getenv("ORDER_SERVICE_URL", "http://order_service:8003")
NOTIFICATION_SERVICE_URL = os.getenv("NOTIFICATION_SERVICE_URL", "http://notification_service:8004")

# Redis configuration for rate limiting
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))

try:
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)
    redis_client.ping()
except redis.ConnectionError:
    redis_client = None

app = FastAPI(
    title="E-commerce API Gateway",
    description="API Gateway for e-commerce microservices",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
RATE_LIMIT_REQUESTS = 100  # requests per minute
RATE_LIMIT_WINDOW = 60     # seconds

def check_rate_limit(client_ip: str) -> bool:
    """Check if client has exceeded rate limit"""
    if not redis_client:
        return True  # No rate limiting if Redis is not available
    
    key = f"rate_limit:{client_ip}"
    current_time = int(time.time())
    window_start = current_time - RATE_LIMIT_WINDOW
    
    # Clean old entries
    redis_client.zremrangebyscore(key, 0, window_start)
    
    # Count current requests
    current_requests = redis_client.zcard(key)
    
    if current_requests >= RATE_LIMIT_REQUESTS:
        return False
    
    # Add current request
    redis_client.zadd(key, {str(current_time): current_time})
    redis_client.expire(key, RATE_LIMIT_WINDOW)
    
    return True

def get_client_ip(request: Request) -> str:
    """Get client IP address"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host

async def proxy_request(
    service_url: str,
    path: str,
    request: Request,
    method: str = "GET",
    json_data: Optional[dict] = None
) -> JSONResponse:
    """Proxy request to microservice"""
    
    # Check rate limit
    client_ip = get_client_ip(request)
    if not check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    url = f"{service_url}{path}"
    
    # Prepare headers (exclude host and content-length)
    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("content-length", None)
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            if method.upper() == "GET":
                response = await client.get(url, headers=headers, params=request.query_params)
            elif method.upper() == "POST":
                response = await client.post(url, headers=headers, json=json_data or await request.json())
            elif method.upper() == "PUT":
                response = await client.put(url, headers=headers, json=json_data or await request.json())
            elif method.upper() == "DELETE":
                response = await client.delete(url, headers=headers)
            else:
                raise HTTPException(status_code=405, detail="Method not allowed")
            
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code,
                headers=dict(response.headers)
            )
            
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Service timeout")
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Service unavailable")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gateway error: {str(e)}")

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the E-commerce API Gateway!",
        "version": "1.0.0",
        "services": {
            "product_service": PRODUCT_SERVICE_URL,
            "admin_service": ADMIN_SERVICE_URL,
            "order_service": ORDER_SERVICE_URL,
            "notification_service": NOTIFICATION_SERVICE_URL
        },
        "redis_status": "connected" if redis_client else "disconnected"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint that checks all services"""
    services = {
        "product_service": PRODUCT_SERVICE_URL,
        "admin_service": ADMIN_SERVICE_URL,
        "order_service": ORDER_SERVICE_URL,
        "notification_service": NOTIFICATION_SERVICE_URL
    }
    
    health_status = {"status": "healthy", "services": {}}
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        for service_name, service_url in services.items():
            try:
                response = await client.get(f"{service_url}/health")
                health_status["services"][service_name] = {
                    "status": "healthy" if response.status_code == 200 else "unhealthy",
                    "response_time": response.elapsed.total_seconds()
                }
            except Exception as e:
                health_status["services"][service_name] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
                health_status["status"] = "degraded"
    
    # Check Redis
    if redis_client:
        try:
            redis_client.ping()
            health_status["redis"] = "connected"
        except Exception as e:
            health_status["redis"] = f"error: {str(e)}"
    else:
        health_status["redis"] = "not configured"
    
    return health_status

# --- Product Service Routes ---

@app.get("/api/products/{path:path}")
async def proxy_products_get(request: Request, path: str):
    """Proxy GET requests to product service"""
    return await proxy_request(PRODUCT_SERVICE_URL, f"/products/{path}", request, "GET")

@app.post("/api/products/{path:path}")
async def proxy_products_post(request: Request, path: str):
    """Proxy POST requests to product service"""
    return await proxy_request(PRODUCT_SERVICE_URL, f"/products/{path}", request, "POST")

@app.put("/api/products/{path:path}")
async def proxy_products_put(request: Request, path: str):
    """Proxy PUT requests to product service"""
    return await proxy_request(PRODUCT_SERVICE_URL, f"/products/{path}", request, "PUT")

@app.delete("/api/products/{path:path}")
async def proxy_products_delete(request: Request, path: str):
    """Proxy DELETE requests to product service"""
    return await proxy_request(PRODUCT_SERVICE_URL, f"/products/{path}", request, "DELETE")

@app.get("/api/categories/{path:path}")
async def proxy_categories_get(request: Request, path: str):
    """Proxy GET requests to product service for categories"""
    return await proxy_request(PRODUCT_SERVICE_URL, f"/categories/{path}", request, "GET")

# --- Admin Service Routes ---

@app.get("/api/admin/{path:path}")
async def proxy_admin_get(request: Request, path: str):
    """Proxy GET requests to admin service"""
    return await proxy_request(ADMIN_SERVICE_URL, f"/admin/{path}", request, "GET")

@app.post("/api/admin/{path:path}")
async def proxy_admin_post(request: Request, path: str):
    """Proxy POST requests to admin service"""
    return await proxy_request(ADMIN_SERVICE_URL, f"/admin/{path}", request, "POST")

@app.put("/api/admin/{path:path}")
async def proxy_admin_put(request: Request, path: str):
    """Proxy PUT requests to admin service"""
    return await proxy_request(ADMIN_SERVICE_URL, f"/admin/{path}", request, "PUT")

@app.delete("/api/admin/{path:path}")
async def proxy_admin_delete(request: Request, path: str):
    """Proxy DELETE requests to admin service"""
    return await proxy_request(ADMIN_SERVICE_URL, f"/admin/{path}", request, "DELETE")

# --- Order Service Routes ---

@app.get("/api/orders/{path:path}")
async def proxy_orders_get(request: Request, path: str):
    """Proxy GET requests to order service"""
    return await proxy_request(ORDER_SERVICE_URL, f"/orders/{path}", request, "GET")

@app.post("/api/checkout/{path:path}")
async def proxy_checkout_post(request: Request, path: str):
    """Proxy POST requests to order service for checkout"""
    return await proxy_request(ORDER_SERVICE_URL, f"/checkout/{path}", request, "POST")

@app.post("/api/orders/{path:path}")
async def proxy_orders_post(request: Request, path: str):
    """Proxy POST requests to order service"""
    return await proxy_request(ORDER_SERVICE_URL, f"/orders/{path}", request, "POST")

@app.put("/api/orders/{path:path}")
async def proxy_orders_put(request: Request, path: str):
    """Proxy PUT requests to order service"""
    return await proxy_request(ORDER_SERVICE_URL, f"/orders/{path}", request, "PUT")

# --- Notification Service Routes ---

@app.get("/api/notifications/{path:path}")
async def proxy_notifications_get(request: Request, path: str):
    """Proxy GET requests to notification service"""
    return await proxy_request(NOTIFICATION_SERVICE_URL, f"/notifications/{path}", request, "GET")

@app.post("/api/notifications/{path:path}")
async def proxy_notifications_post(request: Request, path: str):
    """Proxy POST requests to notification service"""
    return await proxy_request(NOTIFICATION_SERVICE_URL, f"/notifications/{path}", request, "POST")

# --- Convenience Routes ---

@app.get("/api/products/")
async def get_products(request: Request):
    """Get all products"""
    return await proxy_request(PRODUCT_SERVICE_URL, "/products/", request, "GET")

@app.get("/api/products/{product_id}")
async def get_product(request: Request, product_id: int):
    """Get product by ID"""
    return await proxy_request(PRODUCT_SERVICE_URL, f"/products/{product_id}", request, "GET")

@app.post("/api/checkout/")
async def checkout(request: Request):
    """Process checkout"""
    return await proxy_request(ORDER_SERVICE_URL, "/checkout/", request, "POST")

@app.get("/api/orders/{order_id}")
async def get_order(request: Request, order_id: int):
    """Get order by ID"""
    return await proxy_request(ORDER_SERVICE_URL, f"/orders/{order_id}", request, "GET")

@app.get("/api/orders/by-number/{order_number}")
async def get_order_by_number(request: Request, order_number: str):
    """Get order by order number"""
    return await proxy_request(ORDER_SERVICE_URL, f"/orders/by-number/{order_number}", request, "GET")

# --- Error Handlers ---

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "API endpoint not found", "path": str(request.url.path)}
    )

@app.exception_handler(429)
async def rate_limit_handler(request: Request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Please try again later."}
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
