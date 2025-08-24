# backend/data_pipeline/pdm_batch.py (Final Corrected Version)

import os
import logging
import time
import numpy as np
import pandas as pd
import onnxruntime as ort
import pymysql
import pickle
from influxdb_client import InfluxDBClient
from dotenv import load_dotenv
import json

# --- 1. Configuration and Setup ---
load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("PDM_Batch_Runner")

# --- InfluxDB Config ---
INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")

# --- MySQL Config ---
DB_CONFIG = {
    "host": os.getenv("DB_HOST"), "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER"), "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_DATABASE"),
}

# --- Model Artifacts Config ---
MODEL_PATH = "artifacts/rul_model.onnx"
SCALER_PATH = "artifacts/rul_scaler.pkl"

# --- Model Features ---
RUL_MODEL_FEATURES = [
    'Pressure_In', 'Temperature_In', 'Flow_Rate', 'Pressure_Out', 'Temperature_Out', 'Efficiency', 
    'Power_Consumption', 'Vibration', 'Ambient_Temperature', 'Humidity', 'Air_Pollution', 
    'Startup_Shutdown_Cycles', 'Maintenance_Quality', 'Fuel_Quality', 'Load_Factor', 'Anomaly_IForest',
    'Anomaly_LOF', 'Anomaly_DBSCAN', 'Anomaly_Autoencoder', 'Anomaly_Score', 'Final_Anomaly', 
    'Stiffness', 'Frequency', 'Damping', 'Mass', 'vib_std', 'vib_max', 'Amplitude', 'Density', 
    'vib_mean', 'Velocity', 'Viscosity', 'Phase_Angle', 'vib_min', 'vib_rms', 'Pressure_In_Filtered',
    'Temperature_In_Filtered', 'Flow_Rate_Filtered', 'Vibration_Filtered'
]


def fetch_latest_sensor_data_sequence(window_size: int) -> pd.DataFrame:
    """Fetches a sequence of the latest sensor data from InfluxDB as a DataFrame."""
    logger.info(f"Fetching latest {window_size} data points from InfluxDB...")
    with InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG) as client:
        query_api = client.query_api()
        
        flux_query = f'''
            from(bucket: "{INFLUXDB_BUCKET}")
              |> range(start: 0)
              |> filter(fn: (r) => r["_measurement"] == "compressor_metrics")
              |> filter(fn: (r) => contains(value: r._field, set: {json.dumps(RUL_MODEL_FEATURES)}))
              |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
              |> sort(columns: ["_time"], desc: true)
              |> limit(n: {window_size}) 
        '''
        
        tables = query_api.query(flux_query)
        if not tables or len(tables[0].records) < window_size:
            raise ValueError(f"Not enough data in InfluxDB to form a sequence of size {window_size}.")
        
        df = pd.DataFrame([rec.values for rec in tables[0].records])
        logger.info("✅ Successfully fetched latest sensor data sequence.")
        return df


def save_prediction_to_mysql(rul_value: float):
    # ... (This function remains unchanged)
    logger.info(f"Saving RUL value ({rul_value:.2f}) to MySQL...")
    conn = None
    try:
        conn = pymysql.connect(**DB_CONFIG)
        with conn.cursor() as cursor:
            sql = "INSERT INTO rul_predictions (rul_value) VALUES (%s)"
            cursor.execute(sql, (rul_value,))
        conn.commit()
        logger.info("✅ Prediction saved successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to save prediction to MySQL: {e}")
        raise
    finally:
        if conn:
            conn.close()


def main():
    try:
        # 1. Load Model and Scaler
        logger.info(f"Loading RUL model from {MODEL_PATH}...")
        session = ort.InferenceSession(MODEL_PATH)
        input_name = session.get_inputs()[0].name
        window_size, feature_count = session.get_inputs()[0].shape[1:3]

        logger.info(f"Loading scaler from {SCALER_PATH}...")
        with open(SCALER_PATH, 'rb') as f:
            scaler = pickle.load(f)
        
        # 2. Fetch Data
        latest_data_df = fetch_latest_sensor_data_sequence(window_size)
        
        # --- THIS IS THE FIX ---
        # 3. Preprocess Data
        # Ensure columns are in the correct order as expected by the scaler
        latest_data_features = latest_data_df[scaler.get_feature_names_out()]
        
        data_scaled = scaler.transform(latest_data_features)
        
        # Reshape to the (1, window_size, feature_count) format required by the LSTM model
        input_tensor = data_scaled.reshape(1, window_size, feature_count).astype(np.float32)
        
        # 4. Predict RUL
        logger.info("Running RUL prediction...")
        prediction = session.run(None, {input_name: input_tensor})[0]
        rul_value = float(prediction[0][0])
        logger.info(f"Predicted RUL: {rul_value:.2f} days")
        
        # 5. Save to MySQL
        save_prediction_to_mysql(rul_value)

    except Exception as e:
        logger.critical(f"❌ A critical error occurred in the PDM batch script: {e}")


if __name__ == "__main__":
    time.sleep(25) # Wait a bit longer to ensure enough data points exist
    main()