import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import SYNCHRONOUS

# Import your custom classes
from database import CompressorDatabase
from vibration_predictor import VibrationPredictor
from onnxPredictor import ONNXPredictor
from model_class import CompressorStatusPredictor

# --- 1. Configuration ---
load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# MySQL DB Config
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_DATABASE", "compressor_db"),
}

# --- InfluxDB Config ---
INFLUXDB_URL = os.getenv("INFLUXDB_URL", "http://localhost:8086")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")

# Define model paths
STATUS_MODEL_PATH = "backend/compressor_status_prediction_model.onnx"
DART_MODEL_PATH = "backend/dart_model.onnx"

# --- 2. App Initialization ---
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing for the frontend

# --- 3. API Endpoints ---
@app.route('/')
def home():
    """Provides a welcome message and a list of available endpoints."""
    return jsonify({
        "message": "Compressor Digital Twin API is running.",
        "available_endpoints": [
            "/get_all_data", # From MySQL
            "/get_live_data", # From InfluxDB
            "/predict_vibration",
            "/predict_dart",
            "/predict_status"
        ]
    })
    
@app.route('/get_live_data', methods=['GET'])
def get_live_data():
    """Retrieve the latest data points from InfluxDB."""
    try:
        with InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG) as client:
            query_api = client.query_api()
            
            # Flux query to get the last 100 points of 'Vibration' data
            flux_query = f'''
                from(bucket: "{INFLUXDB_BUCKET}")
                |> range(start: 2025-01-01T00:00:00Z)
                |> filter(fn: (r) => r["_measurement"] == "compressor_metrics")
                |> filter(fn: (r) => r["_field"] == "Vibration")
                |> sort(columns: ["_time"], desc: true)
                |> limit(n: 100)
            '''
            
            tables = query_api.query(flux_query, org=INFLUXDB_ORG)
            
            # Convert the result to a simple list of dictionaries
            results = []
            for table in tables:
                for record in table.records:
                    results.append({
                        "time": record.get_time().isoformat(),
                        "field": record.get_field(),
                        "value": record.get_value()
                    })
            
            return jsonify(results)
            
    except Exception as e:
        logging.error(f"Error in /get_live_data: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/get_all_data', methods=['GET'])
def get_all_data():
    """Retrieve all data from the database."""
    db = None
    try:
        db = CompressorDatabase(**DB_CONFIG)
        if not db.connect():
            raise ConnectionError("Failed to connect to database")
        
        if not db.load_data():
            raise ValueError("Failed to load data")

        data = db._data
        return jsonify(data)
    except Exception as e:
        logging.error(f"Error in /get_all_data: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if db:
            db.close()

@app.route('/predict_vibration', methods=['GET'])
def predict_vibration():
    """Returns all vibration predictions."""
    try:
        predictor = VibrationPredictor(db_config=DB_CONFIG)
        if not predictor.initialize():
            raise RuntimeError("Failed to initialize vibration predictor")
        
        results = predictor.predict_all()
        return jsonify(results) if results else (jsonify({"message": "No predictions available"}), 404)
    except Exception as e:
        logging.error(f"Error in /predict_vibration: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/predict_dart', methods=['GET'])
def predict_dart():
    """Performs predictions using the DART model."""
    try:
        predictor = ONNXPredictor(
            DART_MODEL_PATH, DB_CONFIG['host'], DB_CONFIG['user'], DB_CONFIG['password'],
            DB_CONFIG['database'], "compressor_data"
        )
        predicted_values = predictor.predict_all_values()

        if not predicted_values:
            return jsonify({"message": "No predictions available"}), 404
        
        predictions_list = [{"Entry": idx + 1, "Predicted Value": float(value)} for idx, value in enumerate(predicted_values)]
        return jsonify({"Dart Predictions": predictions_list})
    except Exception as e:
        logging.error(f"Error in /predict_dart: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/predict_status', methods=['GET'])
def predict_status():
    """Predicts the compressor's overall status."""
    try:
        predictor = CompressorStatusPredictor(DB_CONFIG, STATUS_MODEL_PATH)
        prediction = predictor.predict()
        
        if prediction is None:
            return jsonify({"error": "Prediction failed"}), 500
            
        return jsonify({"Predicted Status": prediction})
    except Exception as e:
        logging.error(f"Error in /predict_status: {e}")
        return jsonify({"error": str(e)}), 500

# --- 4. Main Execution Block ---
if __name__ == '__main__':
    if not DB_CONFIG['password'] or not INFLUXDB_TOKEN:
        logging.warning("WARNING: Database credentials or InfluxDB token are not set in .env file.")
    app.run(debug=True, port=5000, host='0.0.0.0')