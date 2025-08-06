# backend/app.py
import os
import sys
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Import your custom classes
from database import CompressorDatabase
from vibration_predictor import VibrationPredictor
from onnxPredictor import ONNXPredictor
from model_class import CompressorStatusPredictor

# NEW: Import blueprints from the new files
from routes.data_routes import data_bp
from routes.prediction_routes import prediction_bp


def create_app():
    """
    Creates and configures the Flask application.
    """
    app = Flask(__name__)
    CORS(app)
    load_dotenv()
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    # --- 1. Load Configuration into app.config ---
    app.config['DB_CONFIG'] = {
        "host": os.getenv("DB_HOST", "127.0.0.1"),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD"),
        "database": os.getenv("DB_DATABASE", "compressor_db"),
    }
    app.config['INFLUXDB_URL'] = os.getenv("INFLUXDB_URL", "http://localhost:8086")
    app.config['INFLUXDB_TOKEN'] = os.getenv("INFLUXDB_TOKEN")
    app.config['INFLUXDB_ORG'] = os.getenv("INFLUXDB_ORG")
    app.config['INFLUXDB_BUCKET'] = os.getenv("INFLUXDB_BUCKET")
    
    # CHANGED: Load model paths from environment variables
    status_model_path = os.getenv("STATUS_MODEL_PATH", "backend/compressor_status_prediction_model.onnx")
    dart_model_path = os.getenv("DART_MODEL_PATH", "backend/dart_model.onnx")

    # --- 2. Pre-load ML Models and add to app.config ---
    try:
        logging.info("Pre-loading machine learning models...")
        app.config['STATUS_PREDICTOR'] = CompressorStatusPredictor(app.config['DB_CONFIG'], status_model_path)
        app.config['DART_PREDICTOR'] = ONNXPredictor(
            dart_model_path, app.config['DB_CONFIG']['host'], app.config['DB_CONFIG']['user'], 
            app.config['DB_CONFIG']['password'], app.config['DB_CONFIG']['database'], "compressor_data"
        )
        vibration_predictor = VibrationPredictor(db_config=app.config['DB_CONFIG'])
        if not vibration_predictor.initialize():
            raise RuntimeError("Failed to initialize vibration predictor")
        app.config['VIBRATION_PREDICTOR'] = vibration_predictor
        logging.info("✅ All models loaded successfully.")
    except Exception as e:
        logging.critical(f"❌ Critical error: Failed to load ML models on startup. Error: {e}")
        sys.exit(1)

    # --- 3. Register Blueprints ---
    app.register_blueprint(data_bp)
    app.register_blueprint(prediction_bp)

    @app.route('/')
    def home():
        return jsonify({"message": "Compressor Digital Twin API is running."})

    return app

# --- 4. Main Execution Block ---
if __name__ == '__main__':
    app = create_app()
    if not app.config['DB_CONFIG']['password'] or not app.config['INFLUXDB_TOKEN']:
        logging.warning("WARNING: Database credentials or InfluxDB token are not set in .env file.")
    app.run(debug=True, port=5000, host='0.0.0.0')