# backend/routes/data_routes.py
import logging
from flask import Blueprint, jsonify, current_app, request
from influxdb_client import InfluxDBClient
from influxdb_client.rest import ApiException
from backend.core.database import CompressorDatabase
import pymysql

data_bp = Blueprint("data_routes", __name__)


@data_bp.route("/get_live_data", methods=["GET"])
def get_live_data():
    """
    Retrieve data points from InfluxDB within a specified time range.
    Accepts 'start' (e.g., -1h, -10m) and 'stop' query parameters.
    """
    config = current_app.config
    # CHANGED: Make start and stop times for the query dynamic
    start_time = request.args.get("start", "-1h")  # Default to last 1 hour
    stop_time = request.args.get("stop", "now()")  # Default to now

    try:
        with InfluxDBClient(
            url=config["INFLUXDB_URL"],
            token=config["INFLUXDB_TOKEN"],
            org=config["INFLUXDB_ORG"],
        ) as client:
            query_api = client.query_api()
            flux_query = f'''
                from(bucket: "{config["INFLUXDB_BUCKET"]}")
                |> range(start: {start_time}, stop: {stop_time})
                |> filter(fn: (r) => r["_measurement"] == "compressor_metrics")
                |> sort(columns: ["_time"])
                |> limit(n: 500)
            '''
            tables = query_api.query(flux_query, org=config["INFLUXDB_ORG"])
            results = [
                {
                    "time": record.get_time().isoformat(),
                    "field": record.get_field(),
                    "value": record.get_value(),
                }
                for table in tables
                for record in table.records
            ]
            return jsonify(results)
    # CHANGED: More specific error handling
    except ApiException as e:
        logging.error(f"InfluxDB API Error in /get_live_data: {e.body}")
        return jsonify(
            {"error": "Service unavailable: Could not connect to InfluxDB"}
        ), 503
    except Exception as e:
        logging.error(f"Unexpected error in /get_live_data: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500


@data_bp.route("/get_all_data", methods=["GET"])
def get_all_data():
    db = None
    config = current_app.config
    try:
        db = CompressorDatabase(**config["DB_CONFIG"], table="compressor_data")
        if not db.connect():
            raise ConnectionError("Failed to connect to database")
        if not db.load_data():
            raise ValueError("Failed to load data")
        return jsonify(db._data)
    # CHANGED: More specific error handling
    except (pymysql.Error, ConnectionError) as e:
        logging.error(f"Database connection error in /get_all_data: {e}")
        return jsonify(
            {"error": "Service unavailable: Could not connect to database"}
        ), 503
    except ValueError as e:
        logging.error(f"Data loading error in /get_all_data: {e}")
        return jsonify({"error": f"Bad request: {e}"}), 400
    except Exception as e:
        logging.error(f"Unexpected error in /get_all_data: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if db:
            db.close()
