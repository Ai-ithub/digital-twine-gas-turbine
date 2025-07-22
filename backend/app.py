import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Import your custom classes
from database import CompressorDatabase
from vibration_predictor import VibrationPredictor
from onnxPredictor import ONNXPredictor
from model_class import CompressorStatusPredictor

# --- 1. Configuration ---
# Load variables from .env file for security
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Get DB config from environment variables with defaults for local dev
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD"), # This MUST be set in your .env file
    "database": os.getenv("DB_DATABASE", "compressor_db"),
}

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
            "/get_all_data",
            "/predict_vibration",
            "/predict_dart",
            "/predict_status"
        ]
    })

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
    if not DB_CONFIG['password']:
        logging.warning("WARNING: DB_PASSWORD environment variable is not set. Database connections will likely fail.")
    app.run(debug=True, port=5000, host='0.0.0.0')