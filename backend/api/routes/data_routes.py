# backend/api/routes/data_routes.py
import logging
import json
from flask import Blueprint, jsonify, current_app, request
# NEW IMPORTS: Use the Connection Pool and Cache Manager
from backend.core.db_pool import db_manager
from backend.core.cache_manager import cached_response
# InfluxDB's ApiException is still useful for error handling
from influxdb_client.rest import ApiException

data_bp = Blueprint("data_routes", __name__)


# 1. /get_live_data - Apply 30-second cache
@data_bp.route("/get_live_data", methods=["GET"])
@cached_response(ttl=30)
def get_live_data():
    """
    Retrieve the latest data points from InfluxDB using connection pooling and caching.
    """
    config = current_app.config
    limit_n = 500  # Fixed limit for live dashboard data

    # Use the shared InfluxDB client from the pool manager
    client = db_manager.influx_pool.client
    if not client:
        logging.error("InfluxDB client is not initialized in the pool.")
        return jsonify({"error": "Service unavailable: InfluxDB pool error"}), 503
    
    try:
        query_api = client.query_api()

        flux_query = f'''
            from(bucket: "{config["INFLUXDB_BUCKET"]}")
            |> range(start: 0)
            |> filter(fn: (r) => r["_measurement"] == "compressor_metrics")
            |> sort(columns: ["_time"], desc: true)
            |> limit(n: {limit_n})
            |> sort(columns: ["_time"])
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
        return jsonify({"error": "InfluxDB API error"}), 503
    except Exception as e:
        logging.error(f"Unexpected error in /get_live_data: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500


# 2. /get_all_data - Rewritten to use MySQL Connection Pool
@data_bp.route("/get_all_data", methods=["GET"])
@cached_response(ttl=300) # Historical data benefits from a 5-min cache
def get_all_data():
    """
    Fetches all historical data from MySQL using connection pooling.
    """
    try:
        # Use a connection from the PyMySQL pool. Connection is automatically released.
        with db_manager.pymysql_pool.get_connection() as conn:
            # Assuming the pool is configured to use DictCursor
            cursor = conn.cursor() 
            # Assuming the main table is named 'compressor_data'
            cursor.execute("SELECT * FROM compressor_data ORDER BY Time DESC")
            data = cursor.fetchall()
            cursor.close()
        
        # Convert Time/Timestamp objects to ISO format if necessary before jsonify
        def serialize_data(record):
            for key, value in record.items():
                if hasattr(value, 'isoformat'):
                    record[key] = value.isoformat()
            return record

        serialized_data = [serialize_data(record) for record in data]
        
        return jsonify(serialized_data)
        
    except Exception as e:
        logging.error(f"Database error in /get_all_data (MySQL Pool): {e}")
        return jsonify(
            {"error": "Service unavailable: Could not fetch data from MySQL"}
        ), 503


# 3. /dvr/latest - Apply 60-second cache
@data_bp.route("/dvr/latest", methods=["GET"])
@cached_response(ttl=60)
def get_latest_validated_data():
    """
    Fetches the latest validated records from the DVR module via InfluxDB with caching.
    """
    config = current_app.config
    try:
        limit = int(request.args.get("limit", 10))
        if not 1 <= limit <= 100:
            limit = 10
    except (ValueError, TypeError):
        limit = 10

    # Use the configured bucket name (INFLUXDB_BUCKET)
    validated_bucket = config["INFLUXDB_BUCKET"] 

    # Use the shared InfluxDB client from the pool manager
    client = db_manager.influx_pool.client
    if not client:
        logging.error("InfluxDB client is not initialized in the pool.")
        return jsonify({"error": "Service unavailable: InfluxDB pool error"}), 503

    try:
        query_api = client.query_api()

        flux_query = f'''
            from(bucket: "{validated_bucket}")
              |> range(start: 0)  
              |> filter(fn: (r) => r["_measurement"] == "validated_sensors")
              |> sort(columns: ["_time"], desc: true)
              |> limit(n: {limit})
              |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        '''

        logging.info(f"Executing Flux query on bucket '{validated_bucket}'")
        tables = query_api.query(flux_query, org=config["INFLUXDB_ORG"])

        results = [record.values for table in tables for record in table.records]

        # Log when data is found (or empty)
        logging.info(f"DVR Latest: Found {len(results)} records.")

        return jsonify(results)

    except ApiException as e:
        # Log the full error body for debugging
        logging.error(f"InfluxDB API Error in /dvr/latest: {e.body}")
        return jsonify(
            {
                "error": "Service unavailable: Could not fetch validated data from InfluxDB"
            }
        ), 503
    except Exception as e:
        logging.error(f"Unexpected error in /dvr/latest: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500