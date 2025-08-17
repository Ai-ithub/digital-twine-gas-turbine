# backend/api/routes/data_routes.py
import logging
import os
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


# ===== Persist and Expose Validated DVR Data ======
@data_bp.route("/dvr/latest", methods=["GET"])
def get_latest_validated_data():
    """
    Fetches the latest validated records from the DVR module via InfluxDB.
    Accepts a 'limit' query parameter to specify the number of records.
    """
    config = current_app.config
    # Fetch 'limit' from query parameters, default to 10.
    # Also add a simple validation to keep the number reasonable.
    try:
        limit = int(request.args.get("limit", 10))
        if not 1 <= limit <= 100:
            limit = 10 # Reset to default if out of bounds
    except (ValueError, TypeError):
        limit = 10 # Reset to default if not a valid integer

    # The name of the new bucket for validated data.
    validated_bucket = "compressor-data-validated"

    try:
        with InfluxDBClient(
            url=config["INFLUXDB_URL"],
            token=config["INFLUXDB_TOKEN"],
            org=config["INFLUXDB_ORG"],
        ) as client:
            query_api = client.query_api()
            
            # This Flux query fetches the latest data and pivots it into a more
            # API-friendly format (one JSON object per timestamp).
            flux_query = f'''
                from(bucket: "{validated_bucket}")
                  |> range(start: -1h) 
                  |> filter(fn: (r) => r["_measurement"] == "validated_sensors")
                  |> sort(columns: ["_time"], desc: true)
                  |> limit(n: {limit})
                  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
            '''
            
            logging.info(f"Executing Flux query on bucket '{validated_bucket}'")
            tables = query_api.query(flux_query, org=config["INFLUXDB_ORG"])
            
            # Convert query result to a list of dictionaries
            results = [record.values for table in tables for record in table.records]
            
            return jsonify(results)

    except ApiException as e:
        logging.error(f"InfluxDB API Error in /dvr/latest: {e.body}")
        return jsonify(
            {"error": f"Service unavailable: Could not connect to InfluxDB bucket '{validated_bucket}'"}
        ), 503
    except Exception as e:
        logging.error(f"Unexpected error in /dvr/latest: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500