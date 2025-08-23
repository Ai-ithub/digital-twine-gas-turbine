# app.py
import os
import time
import mysql.connector
from flask import Flask, jsonify, request
from flask_caching import Cache

# --- Flask & Cache Config ---
app = Flask(__name__)
cache = Cache(app, config={'CACHE_TYPE': 'SimpleCache', 'CACHE_DEFAULT_TIMEOUT': 60})

# --- Load Environment Variables ---
DB_HOST = os.getenv('MYSQL_HOST', 'mysql')  # service name in docker-compose
DB_NAME = os.getenv('MYSQL_DATABASE', 'petrodb')
DB_USER = os.getenv('MYSQL_USER', 'app_user')
DB_PASSWORD = os.getenv('MYSQL_PASSWORD', 'pass')
API_KEY = os.getenv('API_KEY', 'changeme')

# --- MySQL Connection Function ---
def get_db_connection():
    retries = 5
    delay = 3
    for attempt in range(retries):
        try:
            conn = mysql.connector.connect(
                host=DB_HOST,
                database=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
                auth_plugin='mysql_native_password'
            )
            return conn
        except mysql.connector.Error as err:
            print(f"MySQL connection failed (attempt {attempt+1}/{retries}): {err}")
            time.sleep(delay)
    raise RuntimeError("Could not connect to MySQL after several retries")

# --- Security Decorator ---
def require_api_key(func):
    def wrapper(*args, **kwargs):
        key = request.headers.get("X-API-KEY")
        if key != API_KEY:
            return jsonify({"status": "error", "message": "Unauthorized"}), 401
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

# --- API Endpoint ---
@app.route("/predict/rul", methods=['GET'])
@require_api_key
@cache.cached()  # caching entire response for 60 sec
def get_latest_rul():
    machine_id = request.args.get("machine_id", default="MACH-01")
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT machine_id, rul_value, confidence, prediction_time
            FROM rul_predictions
            WHERE machine_id = %s
            ORDER BY prediction_time DESC
            LIMIT 1
        """
        cursor.execute(query, (machine_id,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if not row:
            return jsonify({"status": "error", "message": f"No prediction found for {machine_id}"}), 404

        return jsonify({"status": "success", "data": row})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- Root Endpoint ---
@app.route("/", methods=['GET'])
def root():
    return jsonify({"status": "ok", "message": "PetroPalatos RUL API is running"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
