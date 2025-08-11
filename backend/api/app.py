# backend/api/app.py
import os
import sys
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# --- Imports with CORRECTED paths ---
from backend.ml.vibration_predictor import VibrationPredictor
from backend.ml.onnx_predictor import ONNXPredictor
from backend.ml.status_predictor import CompressorStatusPredictor

# Use relative import for sibling modules
from .routes.data_routes import data_bp
from .routes.prediction_routes import prediction_bp


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
        "host": os.getenv("DB_HOST"),
        "port": int(os.getenv("DB_PORT", 3306)),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("DB_PASSWORD"),
        "database": os.getenv("DB_DATABASE"),
    }
    app.config['INFLUXDB_URL'] = os.getenv("INFLUXDB_URL")
    app.config['INFLUXDB_TOKEN'] = os.getenv("INFLUXDB_TOKEN")
    app.config['INFLUXDB_ORG'] = os.getenv("INFLUXDB_ORG")
    app.config['INFLUXDB_BUCKET'] = os.getenv("INFLUXDB_BUCKET")
    
    # CORRECTED: Default model paths now point to the 'artifacts' directory
    status_model_path = os.getenv("STATUS_MODEL_PATH", "artifacts/compressor_status_prediction_model.onnx")
    dart_model_path = os.getenv("DART_MODEL_PATH", "artifacts/dart_model.onnx")

    # --- 2. Pre-load ML Models and add to app.config ---
    try:
        logging.info("Pre-loading machine learning models...")
        
        # Define paths
        status_model_path = os.getenv("STATUS_MODEL_PATH", "artifacts/compressor_status_prediction_model.onnx")
        dart_model_path = os.getenv("DART_MODEL_PATH", "artifacts/dart_model.onnx")
        vibration_model_path = os.getenv("VIBRATION_MODEL_PATH", "artifacts/farid_kaki_vibration_transformer.onnx")
        scaler_mean_path = os.getenv("SCALER_MEAN_PATH", "artifacts/scaler_mean.npy")
        scaler_scale_path = os.getenv("SCALER_SCALE_PATH", "artifacts/scaler_scale.npy")

        # Initialize predictors with correct paths
        app.config['STATUS_PREDICTOR'] = CompressorStatusPredictor(app.config['DB_CONFIG'], status_model_path)
        app.config['DART_PREDICTOR'] = ONNXPredictor(dart_model_path, app.config['DB_CONFIG'])
        app.config['VIBRATION_PREDICTOR'] = VibrationPredictor(
            db_config=app.config['DB_CONFIG'],
            model_path=vibration_model_path,
            scaler_mean_path=scaler_mean_path,
            scaler_scale_path=scaler_scale_path
        )
        
        if not app.config['VIBRATION_PREDICTOR'].initialize():
            raise RuntimeError("Failed to initialize vibration predictor")
            
        logging.info("✅ All models loaded successfully.")
    except Exception as e:
        logging.critical(f"❌ Critical error: Failed to load ML models on startup. Error: {e}")
        sys.exit(1)

    # --- 3. Register Blueprints ---
    app.register_blueprint(data_bp, url_prefix='/data')
    app.register_blueprint(prediction_bp, url_prefix='/predict')

    @app.route('/')
    def home():
        return jsonify({"message": "Compressor Digital Twin API is running."})

    return app

# --- 4. Main Execution Block ---
if __name__ == '__main__':
    app = create_app()
    if not app.config['DB_CONFIG'].get('password') or not app.config['INFLUXDB_TOKEN']:
        logging.warning("WARNING: Database credentials or InfluxDB token are not set in .env file.")
    app.run(debug=True, port=5000, host='0.0.0.0')