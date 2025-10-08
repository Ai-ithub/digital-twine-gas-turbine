"""
Redis Cache Manager for Digital Twin Application
Provides caching functionality for API responses and model predictions.
"""

import redis
import json
import logging
import os
from typing import Any, Optional, Union
from datetime import timedelta
from functools import wraps
from flask import request, jsonify

logger = logging.getLogger(__name__)

class CacheManager:
    """Redis-based cache manager for API responses and model predictions."""
    
    def __init__(self):
        """Initialize Redis connection with configuration from environment."""
        self.redis_host = os.getenv('REDIS_HOST', 'localhost')
        self.redis_port = int(os.getenv('REDIS_PORT', 6379))
        self.redis_db = int(os.getenv('REDIS_DB', 0))
        self.redis_password = os.getenv('REDIS_PASSWORD', None)
        
        # Default TTL values (in seconds)
        self.default_ttl = int(os.getenv('CACHE_DEFAULT_TTL', 300))  # 5 minutes
        self.prediction_ttl = int(os.getenv('CACHE_PREDICTION_TTL', 60))  # 1 minute
        self.historical_data_ttl = int(os.getenv('CACHE_HISTORICAL_TTL', 1800))  # 30 minutes
        
        self._connect()
    
    def _connect(self):
        """Establish Redis connection with retry logic."""
        try:
            self.redis_client = redis.Redis(
                host=self.redis_host,
                port=self.redis_port,
                db=self.redis_db,
                password=self.redis_password,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )
            # Test connection
            self.redis_client.ping()
            logger.info(f"✅ Connected to Redis at {self.redis_host}:{self.redis_port}")
        except Exception as e:
            logger.error(f"❌ Failed to connect to Redis: {e}")
            self.redis_client = None
    
    def is_available(self) -> bool:
        """Check if Redis is available."""
        if not self.redis_client:
            return False
        try:
            self.redis_client.ping()
            return True
        except:
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if not self.is_available():
            return None
        
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with TTL."""
        if not self.is_available():
            return False
        
        try:
            ttl = ttl or self.default_ttl
            serialized_value = json.dumps(value, default=str)
            return self.redis_client.setex(key, ttl, serialized_value)
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache."""
        if not self.is_available():
            return False
        
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern."""
        if not self.is_available():
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache clear pattern error for {pattern}: {e}")
            return 0
    
    def generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate cache key from prefix and parameters."""
        key_parts = [prefix]
        
        # Add positional arguments
        for arg in args:
            key_parts.append(str(arg))
        
        # Add keyword arguments (sorted for consistency)
        for k, v in sorted(kwargs.items()):
            key_parts.append(f"{k}:{v}")
        
        return ":".join(key_parts)

# Global cache manager instance
cache_manager = CacheManager()

def cached_response(ttl: Optional[int] = None, key_prefix: str = "api"):
    """
    Decorator for caching API responses.
    
    Args:
        ttl: Time to live in seconds
        key_prefix: Prefix for cache key
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from request
            cache_key = cache_manager.generate_key(
                key_prefix,
                func.__name__,
                request.method,
                request.path,
                str(sorted(request.args.items()))
            )
            
            # Try to get from cache
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for key: {cache_key}")
                return jsonify(cached_result)
            
            # Execute function and cache result
            try:
                result = func(*args, **kwargs)
                
                # Extract data from Flask response
                if hasattr(result, 'get_json'):
                    data = result.get_json()
                elif isinstance(result, tuple) and len(result) >= 1:
                    data = result[0] if hasattr(result[0], 'get_json') else result[0]
                else:
                    data = result
                
                # Cache the result
                cache_manager.set(cache_key, data, ttl)
                logger.debug(f"Cached result for key: {cache_key}")
                
                return result
            except Exception as e:
                logger.error(f"Error in cached function {func.__name__}: {e}")
                return func(*args, **kwargs)
        
        return wrapper
    return decorator

def cached_prediction(model_name: str, ttl: Optional[int] = None):
    """
    Decorator for caching model predictions.
    
    Args:
        model_name: Name of the model for cache key
        ttl: Time to live in seconds (defaults to prediction_ttl)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Use prediction TTL if not specified
            cache_ttl = ttl or cache_manager.prediction_ttl
            
            # Generate cache key from function arguments
            cache_key = cache_manager.generate_key(
                "prediction",
                model_name,
                func.__name__,
                str(args),
                str(sorted(kwargs.items()))
            )
            
            # Try to get from cache
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Prediction cache hit for {model_name}")
                return cached_result
            
            # Execute function and cache result
            try:
                result = func(*args, **kwargs)
                cache_manager.set(cache_key, result, cache_ttl)
                logger.debug(f"Cached prediction for {model_name}")
                return result
            except Exception as e:
                logger.error(f"Error in cached prediction {func.__name__}: {e}")
                return func(*args, **kwargs)
        
        return wrapper
    return decorator