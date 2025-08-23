import os
from dotenv import load_dotenv
from urllib.parse import urlparse
import onnxruntime as ort
from influxdb_client import InfluxDBClient
import mysql.connector
import numpy as np
import socket

# --- Load env variables ---
load_dotenv()

# --- Auto-detect docker environment ---
def running_in_docker():
    # Checks if /.dockerenv file exists (standard Docker container indicator)
    return os.path.exists("/.dockerenv")

IN_DOCKER = running_in_docker()

# --- Config with fallback ---
INFLUX_URL = os.getenv("INFLUX_URL") or (
    "http://influxdb:8086" if IN_DOCKER else "http://localhost:8086"
)
MYSQL_HOST = os.getenv("MYSQL_HOST") or (
    "mysql" if IN_DOCKER else "localhost"
)
MYSQL_PORT = int(os.getenv("MYSQL_PORT") or (3306 if IN_DOCKER else 3307))
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN", "")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_ROOT_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "")

MODEL_PATH = os.getenv("MODEL_PATH", "rul_model.onnx")

# --- Debug print ---
print(f"[INFO] Running in Docker: {IN_DOCKER}")
print(f"[INFO] InfluxDB URL: {INFLUX_URL}")
print(f"[INFO] MySQL Host: {MYSQL_HOST}:{MYSQL_PORT}")
print(f"[INFO] Model Path: {MODEL_PATH}")

# --- Load ONNX model ---
try:
    ort_session = ort.InferenceSession(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Error loading ONNX model: {e}")

# --- Connect to InfluxDB ---
try:
    influx_client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org="_")
    print("[INFO] Connected to InfluxDB")
except Exception as e:
    raise RuntimeError(f"Error connecting to InfluxDB: {e}")

# --- Fetch latest sensor data ---
def fetch_latest_data(bucket, measurement, fields, limit=1):
    query = f'''
        from(bucket: "{bucket}")
          |> range(start: -1h)
          |> filter(fn: (r) => r._measurement == "{measurement}")
          |> filter(fn: (r) => contains(value: r._field, set: {fields}))
          |> last()
    '''
    query_api = influx_client.query_api()
    tables = query_api.query(query=query)
    values = []
    for table in tables:
        for record in table.records:
            values.append(record.get_value())
    return np.array(values, dtype=np.float32).reshape(1, -1)

# Example usage
bucket = os.getenv("INFLUX_BUCKET", "sensor_data")
measurement = os.getenv("INFLUX_MEASUREMENT", "turbine_signals")
fields = os.getenv("INFLUX_FIELDS", '["signal1","signal2","signal3"]').split(",")

data = fetch_latest_data(bucket, measurement, fields)

# --- Run prediction ---
if data.size > 0:
    prediction = ort_session.run(None, {ort_session.get_inputs()[0].name: data})
    rul_value = float(prediction[0][0])
    print(f"[INFO] Predicted RUL: {rul_value}")
else:
    raise RuntimeError("No data fetched from InfluxDB")

# --- Save result to MySQL ---
try:
    conn = mysql.connector.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE
    )
    cursor = conn.cursor()
    cursor.execute("INSERT INTO rul_predictions (rul_value) VALUES (%s)", (rul_value,))
    conn.commit()
    print("[INFO] Prediction inserted into MySQL")
except Exception as e:
    raise RuntimeError(f"Error writing to MySQL: {e}")
finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()
