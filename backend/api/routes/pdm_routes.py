# backend/api/routes/pdm_routes.py

import logging
from flask import Blueprint, jsonify, current_app
import pymysql

pdm_bp = Blueprint("pdm_routes", __name__)


@pdm_bp.route("/rul", methods=["GET"])
def get_latest_rul():
    """Fetches the latest RUL prediction from the database."""
    db_config = current_app.config["DB_CONFIG"]
    conn = None
    try:
        conn = pymysql.connect(**db_config, cursorclass=pymysql.cursors.DictCursor)
        cursor = conn.cursor()

        # This table needs to be created
        query = "SELECT * FROM rul_predictions ORDER BY prediction_time DESC LIMIT 1"
        cursor.execute(query)

        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "No RUL prediction found"}), 404

        # Convert datetime to string for JSON serialization
        if "prediction_time" in row and row["prediction_time"] is not None:
            row["prediction_time"] = row["prediction_time"].isoformat()

        return jsonify(row)

    except pymysql.err.ProgrammingError as e:
        # This error happens if the table doesn't exist
        logging.error(f"Database error (likely missing table 'rul_predictions'): {e}")
        return jsonify(
            {"error": "RUL data not available. Table 'rul_predictions' may not exist."}
        ), 503
    except Exception as e:
        logging.error(f"Error in /rul endpoint: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn:
            conn.close()
