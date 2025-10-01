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
from backend.core import config

# --- Setup Logging and Load Env ---
load_dotenv()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("PDM_Batch_Runner")

# --- Use Config Variables (MySQL Config) ---
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_DATABASE"),
}


def fetch_latest_sensor_data_sequence(window_size: int) -> pd.DataFrame:
    """Fetches a sequence of the latest sensor data from InfluxDB as a DataFrame."""
    logger.info(f"Fetching latest {window_size} data points from InfluxDB...")
    with InfluxDBClient(
        url=os.getenv("INFLUXDB_URL"),
        token=os.getenv("INFLUXDB_TOKEN"),
        org=os.getenv("INFLUXDB_ORG"),
        timeout=30_000,
    ) as client:
        query_api = client.query_api()

        flux_query = f'''
            from(bucket: "{os.getenv("INFLUXDB_BUCKET")}")
              |> range(start: 0)
              |> filter(fn: (r) => r["_measurement"] == "compressor_metrics")
              |> filter(fn: (r) => contains(value: r._field, set: {json.dumps(config.RUL_MODEL_FEATURES)}))
              |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
              |> sort(columns: ["_time"], desc: true)
              |> limit(n: {window_size}) 
        '''

        tables = query_api.query(flux_query)
        if not tables or len(tables[0].records) < window_size:
            raise ValueError(
                f"Not enough data in InfluxDB to form a sequence of size {window_size}."
            )

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
        # --- 4. Use Config Variables for Model Paths and Features ---
        logger.info(f"Loading RUL model from {config.RUL_MODEL_PATH}...")
        session = ort.InferenceSession(config.RUL_MODEL_PATH)
        input_name = session.get_inputs()[0].name
        window_size, feature_count = session.get_inputs()[0].shape[1:3]

        logger.info(f"Loading scaler from {config.RUL_SCALER_PATH}...")
        with open(config.RUL_SCALER_PATH, "rb") as f:
            scaler = pickle.load(f)

        latest_data_df = fetch_latest_sensor_data_sequence(window_size)

        latest_data_features = latest_data_df[scaler.get_feature_names_out()]
        data_scaled = scaler.transform(latest_data_features)
        input_tensor = data_scaled.reshape(1, window_size, feature_count).astype(
            np.float32
        )

        logger.info("Running RUL prediction...")
        prediction = session.run(None, {input_name: input_tensor})[0]
        rul_value = float(prediction[0][0])
        logger.info(f"Predicted RUL: {rul_value:.2f} days")

        save_prediction_to_mysql(rul_value)

    except Exception as e:
        logger.critical(f"❌ A critical error occurred in the PDM batch script: {e}")


if __name__ == "__main__":
    time.sleep(200)
    main()
