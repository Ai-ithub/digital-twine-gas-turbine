# backend/api/routes/health_routes.py

import logging
import time
from flask import Blueprint, jsonify, current_app
from backend.core.db_pool import db_manager
from backend.core.cache_manager import cache_manager
import os
import psutil

health_bp = Blueprint("health_routes", __name__)

@health_bp.route("/health", methods=["GET"])
def health_check():
    """Basic health check endpoint."""
    return jsonify({
        "status": "healthy",
        "timestamp": time.time(),
        "service": "digital-twin-api"
    })

@health_bp.route("/health/detailed", methods=["GET"])
def detailed_health_check():
    """Detailed health check including all dependencies."""
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "digital-twin-api",
        "checks": {}
    }
    
    overall_healthy = True
    
    # Database health checks
    try:
        db_health = db_manager.health_check()
        health_status["checks"]["databases"] = {
            "mysql": {
                "status": "healthy" if db_health.get("mysql", False) else "unhealthy",
                "available": db_health.get("mysql", False)
            },
            "influxdb": {
                "status": "healthy" if db_health.get("influxdb", False) else "unhealthy",
                "available": db_health.get("influxdb", False)
            }
        }
        
        if not all(db_health.values()):
            overall_healthy = False
            
    except Exception as e:
        logging.error(f"Database health check failed: {e}")
        health_status["checks"]["databases"] = {
            "status": "error",
            "error": str(e)
        }
        overall_healthy = False
    
    # Redis/Cache health check
    try:
        cache_available = cache_manager.is_available()
        health_status["checks"]["cache"] = {
            "status": "healthy" if cache_available else "unhealthy",
            "available": cache_available,
            "type": "redis"
        }
        
        if not cache_available:
            overall_healthy = False
            
    except Exception as e:
        logging.error(f"Cache health check failed: {e}")
        health_status["checks"]["cache"] = {
            "status": "error",
            "error": str(e)
        }
        overall_healthy = False
    
    # System resources check
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        health_status["checks"]["system"] = {
            "status": "healthy",
            "cpu_percent": cpu_percent,
            "memory": {
                "total": memory.total,
                "available": memory.available,
                "percent": memory.percent,
                "used": memory.used
            },
            "disk": {
                "total": disk.total,
                "free": disk.free,
                "used": disk.used,
                "percent": (disk.used / disk.total) * 100
            }
        }
        
        # Check if system resources are critically low
        if memory.percent > 90 or (disk.used / disk.total) * 100 > 95:
            health_status["checks"]["system"]["status"] = "warning"
            
    except Exception as e:
        logging.error(f"System health check failed: {e}")
        health_status["checks"]["system"] = {
            "status": "error",
            "error": str(e)
        }
    
    # Environment variables check
    try:
        required_env_vars = [
            "MYSQL_HOST", "MYSQL_USER", "MYSQL_DATABASE",
            "INFLUXDB_URL", "INFLUXDB_TOKEN", "INFLUXDB_ORG"
        ]
        
        missing_vars = [var for var in required_env_vars if not os.getenv(var)]
        
        health_status["checks"]["environment"] = {
            "status": "healthy" if not missing_vars else "unhealthy",
            "missing_variables": missing_vars,
            "total_required": len(required_env_vars),
            "configured": len(required_env_vars) - len(missing_vars)
        }
        
        if missing_vars:
            overall_healthy = False
            
    except Exception as e:
        logging.error(f"Environment check failed: {e}")
        health_status["checks"]["environment"] = {
            "status": "error",
            "error": str(e)
        }
        overall_healthy = False
    
    # Update overall status
    health_status["status"] = "healthy" if overall_healthy else "unhealthy"
    
    # Return appropriate HTTP status code
    status_code = 200 if overall_healthy else 503
    
    return jsonify(health_status), status_code

@health_bp.route("/health/ready", methods=["GET"])
def readiness_check():
    """Kubernetes-style readiness probe."""
    try:
        # Check critical dependencies
        db_health = db_manager.health_check()
        
        if db_health.get("mysql", False):
            return jsonify({
                "status": "ready",
                "timestamp": time.time()
            })
        else:
            return jsonify({
                "status": "not_ready",
                "reason": "database_unavailable",
                "timestamp": time.time()
            }), 503
            
    except Exception as e:
        logging.error(f"Readiness check failed: {e}")
        return jsonify({
            "status": "not_ready",
            "reason": "check_failed",
            "error": str(e),
            "timestamp": time.time()
        }), 503

@health_bp.route("/health/live", methods=["GET"])
def liveness_check():
    """Kubernetes-style liveness probe."""
    try:
        # Simple check that the application is running
        return jsonify({
            "status": "alive",
            "timestamp": time.time(),
            "uptime": time.time() - getattr(current_app, 'start_time', time.time())
        })
    except Exception as e:
        logging.error(f"Liveness check failed: {e}")
        return jsonify({
            "status": "dead",
            "error": str(e),
            "timestamp": time.time()
        }), 500

@health_bp.route("/metrics", methods=["GET"])
def get_metrics():
    """Prometheus-style metrics endpoint."""
    try:
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Database connection pool metrics
        mysql_pool_size = getattr(db_manager.mysql_pool, 'pool_size', 0)
        
        # Cache metrics
        cache_available = cache_manager.is_available()
        
        metrics = {
            "system_cpu_percent": cpu_percent,
            "system_memory_percent": memory.percent,
            "system_memory_used_bytes": memory.used,
            "system_memory_total_bytes": memory.total,
            "system_disk_percent": (disk.used / disk.total) * 100,
            "system_disk_used_bytes": disk.used,
            "system_disk_total_bytes": disk.total,
            "mysql_pool_size": mysql_pool_size,
            "cache_available": 1 if cache_available else 0,
            "timestamp": time.time()
        }
        
        return jsonify(metrics)
        
    except Exception as e:
        logging.error(f"Metrics collection failed: {e}")
        return jsonify({
            "error": "metrics_collection_failed",
            "message": str(e),
            "timestamp": time.time()
        }), 500