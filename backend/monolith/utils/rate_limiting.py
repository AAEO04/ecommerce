# file: utils/rate_limiting.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import redis
from config import settings
from utils import constants

# Redis connection for rate limiting
try:
    redis_client = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB,
        decode_responses=True
    )
    redis_client.ping()  # Test connection
except Exception:
    redis_client = None

# Rate limiter configuration
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}" if redis_client else "memory://",
    default_limits=[constants.RATE_LIMIT_API]  # Default rate limit
)

# Custom rate limit exceeded handler
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    response = JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": f"Rate limit exceeded: {exc.detail}",
            "retry_after": exc.retry_after
        }
    )
    response = request.app.state.limiter._inject_headers(
        response, request.state.view_rate_limit
    )
    return response

# Rate limit decorators for different endpoints
def auth_rate_limit():
    """Rate limit for authentication endpoints"""
    return limiter.limit(constants.RATE_LIMIT_AUTH)

def checkout_rate_limit():
    """Rate limit for checkout endpoint"""
    return limiter.limit(constants.RATE_LIMIT_CHECKOUT)

def api_rate_limit():
    """Rate limit for general API endpoints"""
    return limiter.limit(constants.RATE_LIMIT_API)

def admin_rate_limit():
    """Rate limit for admin endpoints"""
    return limiter.limit(constants.RATE_LIMIT_API)

def upload_rate_limit():
    """Rate limit for file upload endpoints"""
    return limiter.limit(constants.RATE_LIMIT_API)
