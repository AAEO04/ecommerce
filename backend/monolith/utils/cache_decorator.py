from functools import wraps
from typing import Callable, Any, Optional
import hashlib
import json
from .cache import get_from_cache, set_cache

def cached(
    prefix: str,
    expire: int = 3600,
    key_builder: Optional[Callable] = None
):
    """
    Cache decorator for FastAPI endpoints
    
    Usage:
        @cached("products", expire=3600)
        def get_products(db: Session, skip: int = 0, limit: int = 100):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            # Build cache key from function args
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                # Default: hash function name + args
                # Exclude 'db' (Session) from kwargs for cache key generation
                kwargs_for_key = {k: v for k, v in kwargs.items() if k != 'db'}
                key_data = f"{func.__name__}:{json.dumps(kwargs_for_key, sort_keys=True)}"
                key_hash = hashlib.md5(key_data.encode()).hexdigest()
                cache_key = f"{prefix}:{key_hash}"
            
            # Try cache first
            cached_data = get_from_cache(cache_key)
            if cached_data is not None:
                return cached_data
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Cache result
            set_cache(cache_key, result, expire)
            
            return result
        
        return wrapper
    return decorator
