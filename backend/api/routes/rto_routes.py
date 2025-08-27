# backend/api/routes/rto_routes.py

import logging
from flask import Blueprint, jsonify, current_app
import pymysql
from influxdb_client import InfluxDBClient
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

@rto_bp.route("/efficiency_history", methods=['GET'])
def get_efficiency_history():
    """ Fetches the last 24 hours of efficiency data from InfluxDB. """
    config = current_app.config
    conn = None
    try:
        with InfluxDBClient(url=config["INFLUXDB_URL"], token=config["INFLUXDB_TOKEN"], org=config["INFLUXDB_ORG"]) as client:
            query_api = client.query_api()
            flux_query = f'''
                from(bucket: "{config["INFLUXDB_BUCKET"]}")
                |> range(start: -24h) 
                |> filter(fn: (r) => r["_measurement"] == "compressor_metrics")
                |> filter(fn: (r) => r["_field"] == "Efficiency")
                |> aggregateWindow(every: 10m, fn: mean, createEmpty: false)
                |> yield(name: "mean")
            '''
            tables = query_api.query(flux_query)
            results = [{
                "time": record.get_time().isoformat(),
                "efficiency": record.get_value() * 100
            } for table in tables for record in table.records]
            
            results.sort(key=lambda x: x['time'])
            
            return jsonify(results)

    except Exception as e:
        logging.error(f"Error in /efficiency_history endpoint: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500