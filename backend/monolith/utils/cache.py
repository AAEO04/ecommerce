# file: utils/cache.py
import redis
import json
from typing import Optional
from config import settings

# Initialize Redis client (optional)
try:
    redis_client = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB,
        decode_responses=True
    )
    redis_client.ping()
    print("Redis connected successfully")
except redis.ConnectionError:
    redis_client = None
    print("Warning: Redis not available, caching disabled")

def get_cache_key(prefix: str, **kwargs) -> str:
    """Generate cache key from prefix and parameters"""
    params = "_".join([f"{k}:{v}" for k, v in sorted(kwargs.items())])
    return f"{prefix}:{params}"

def get_from_cache(key: str) -> Optional[dict]:
    """Get data from Redis cache"""
    if not redis_client:
        return None
    try:
        data = redis_client.get(key)
        return json.loads(data) if data else None
    except (json.JSONDecodeError, redis.RedisError):
        return None

def set_cache(key: str, data: dict, expire: int = 3600) -> None:
    """Set data in Redis cache with expiration"""
    if not redis_client:
        return
    try:
        redis_client.setex(key, expire, json.dumps(data, default=str))
    except redis.RedisError:
        pass

def invalidate_cache(product_id: Optional[int] = None):
    """Invalidate product-related cache entries"""
    if not redis_client:
        return
    try:
        if product_id:
            pattern = f"product:*product_id:{product_id}*"
        else:
            pattern = "product:*"
        
        cursor = 0
        while True:
            cursor, keys = redis_client.scan(cursor=cursor, match=pattern, count=500)
            if keys:
                redis_client.delete(*keys)
            if cursor == 0:
                break
    except redis.RedisError:
        pass

