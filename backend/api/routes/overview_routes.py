# backend/api/routes/overview_routes.py

from flask import Blueprint, jsonify
import logging
# NEW IMPORT: Use the Cache Manager decorator
from backend.core.cache_manager import cached_response

# Create a Blueprint
overview_bp = Blueprint("overview_routes", __name__)


@overview_bp.route("/overview", methods=["GET"])
@cached_response(ttl=120) # Apply 120-second cache as per requirements
def get_system_overview():
    """
    Provides a high-level overview of the system's status, now with caching.
    This will be connected to real data sources later.
    """
    try:
        # NOTE: This is mock data for now.
        # Once connected to real data, the cache ensures this is only computed every 120s.
        overview_data = {
            "status": "Normal",
            "rul": 118,
            "efficiency": 87.5,
            "alerts_24h": 5,
        }
        return jsonify(overview_data)
    except Exception as e:
        logging.error(f"Error in /overview endpoint: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500