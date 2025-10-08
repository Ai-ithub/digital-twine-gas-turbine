# backend/api/routes/pdm_routes.py

import logging
from flask import Blueprint, jsonify
import pymysql
from backend.core.db_pool import db_manager
import time

pdm_bp = Blueprint("pdm_routes", __name__)


def generate_recommendations(rul_value):
    """Generates dynamic maintenance recommendations based on the RUL value."""
    recommendations = []

    # Safely convert rul_value to float, defaulting to 100.0 if conversion fails.
    try:
        rul = float(rul_value)
    except (ValueError, TypeError):
        logging.warning(
            f"Could not convert RUL value '{rul_value}' to float. Defaulting to 100.0."
        )
        rul = 100.0

    logging.info(f"Generating recommendations for RUL value: {rul}")

    if rul < 10:
        recommendations.append(
            {
                "id": 1,
                "component": "Main Bearing",
                "action": "Critical: Replace immediately to prevent imminent failure.",
                "urgency": "High",
            }
        )
    elif rul < 30:
        recommendations.append(
            {
                "id": 2,
                "component": "Main Bearing",
                "action": "Inspect for wear and schedule replacement within 14 days.",
                "urgency": "High",
            }
        )
        recommendations.append(
            {
                "id": 3,
                "component": "Inlet Filter",
                "action": "Replace filter at the next opportunity.",
                "urgency": "Medium",
            }
        )
    elif rul < 90:
        recommendations.append(
            {
                "id": 4,
                "component": "Inlet Filter",
                "action": "Check for clogging and plan for replacement.",
                "urgency": "Medium",
            }
        )
        recommendations.append(
            {
                "id": 5,
                "component": "Lubrication System",
                "action": "Check oil levels and quality.",
                "urgency": "Low",
            }
        )
    else:
        recommendations.append(
            {
                "id": 6,
                "component": "System Health",
                "action": "No immediate maintenance required. Continue routine checks.",
                "urgency": "Low",
            }
        )

    return recommendations


@pdm_bp.route("/rul", methods=["GET"])
def get_latest_rul():
    """Fetches the latest RUL prediction and generates recommendations using the connection pool with retries."""
    # FIX: Increased MAX_RETRIES and RETRY_DELAY to handle pool contention from batch jobs (total wait up to 10s)
    MAX_RETRIES = 5
    RETRY_DELAY = 2  # seconds

    for attempt in range(MAX_RETRIES):
        try:
            # Attempt to get connection from the pool
            with db_manager.pymysql_pool.get_connection() as conn:
                with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                    query = "SELECT rul_value, prediction_time FROM rul_predictions ORDER BY prediction_time DESC LIMIT 1"
                    cursor.execute(query)
                    prediction = cursor.fetchone()

            # --- If connection and query are successful, process the data ---

            # Handle case where the table is empty (prediction is None)
            if not prediction:
                logging.warning("No RUL prediction found in database. Returning 404.")
                return jsonify({"error": "No RUL prediction found"}), 404

            # Explicitly cast rul_value to native Python float for JSON serialization safety.
            try:
                rul_value = float(prediction.get("rul_value"))
            except (ValueError, TypeError):
                # Fallback to a safe default if casting fails
                rul_value = 0.0
                logging.error(f"Failed to cast rul_value: {prediction.get('rul_value')} to float.")

            # Safely convert prediction_time to ISO string format
            prediction_time = prediction.get("prediction_time")
            if prediction_time and hasattr(prediction_time, 'isoformat'):
                time_str = prediction_time.isoformat()
            else:
                # Fallback to string representation or empty string
                time_str = str(prediction_time) if prediction_time else ""
                logging.warning(f"prediction_time is not a datetime object. Used raw string: {time_str}")

            recommendations = generate_recommendations(rul_value)

            response_data = {
                "rul_value": rul_value,
                "prediction_time": time_str,
                "recommendations": recommendations,
            }

            # Return the successful response and break the retry loop
            return jsonify(response_data)

        except Exception as e:
            # Check if it is the last attempt
            if attempt < MAX_RETRIES - 1:
                logging.warning(f"MySQL Pool acquisition failed (Attempt {attempt + 1}/{MAX_RETRIES}). Retrying in {RETRY_DELAY}s. Error: {e}")
                time.sleep(RETRY_DELAY)
            else:
                # Final failure after all retries results in 503
                logging.error(f"CRITICAL RUL ERROR: MySQL Pool exhausted after {MAX_RETRIES} attempts. Endpoint failed. Error: {e}", exc_info=True)
                return jsonify({"error": "Service unavailable: Database connection pool exhausted"}), 503