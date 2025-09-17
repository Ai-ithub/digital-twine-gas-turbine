# backend/api/routes/alarms_routes.py

import logging
from flask import Blueprint, jsonify, current_app, request
import pymysql

alarms_bp = Blueprint("alarms_routes", __name__)

@alarms_bp.route("/history", methods=['GET'])
def get_alarms_history():
    """ Fetches a paginated list of historical alarms from the database. """
    db_config = current_app.config["DB_CONFIG"]
    conn = None
    try:
        limit = int(request.args.get("limit", 100))
        conn = pymysql.connect(**db_config, cursorclass=pymysql.cursors.DictCursor)
        with conn.cursor() as cursor:
            query = "SELECT * FROM alarms ORDER BY timestamp DESC LIMIT %s"
            cursor.execute(query, (limit,))
            alarms = cursor.fetchall()

        # Convert datetime objects to ISO 8601 strings
        for alarm in alarms:
            if 'timestamp' in alarm and alarm['timestamp'] is not None:
                alarm['timestamp'] = alarm['timestamp'].isoformat()

        return jsonify(alarms)

    except Exception as e:
        logging.error(f"Error in /alarms/history endpoint: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn:
            conn.close()