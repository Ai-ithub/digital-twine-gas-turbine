# backend/api/routes/rto_routes.py

import logging
from flask import Blueprint, jsonify, current_app
import pymysql

rto_bp = Blueprint("rto_routes", __name__)


@rto_bp.route("/suggestion", methods=["GET"])
def get_latest_rto_suggestion():
    """Fetches the latest RTO suggestion from the database."""
    db_config = current_app.config["DB_CONFIG"]
    conn = None
    try:
        conn = pymysql.connect(**db_config, cursorclass=pymysql.cursors.DictCursor)
        with conn.cursor() as cursor:
            query = "SELECT * FROM rto_suggestions ORDER BY generated_at DESC LIMIT 1"
            cursor.execute(query)
            suggestion = cursor.fetchone()

        if not suggestion:
            return jsonify(
                {"suggestion_text": "No optimization suggestion available yet."}
            ), 404

        # Convert datetime to string for JSON
        suggestion["generated_at"] = suggestion["generated_at"].isoformat()

        return jsonify(suggestion)

    except Exception as e:
        logging.error(f"Error in /suggestion endpoint: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn:
            conn.close()
