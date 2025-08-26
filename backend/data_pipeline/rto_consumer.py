# backend/data_pipeline/rto_consumer.py (Final Corrected Version)

import os
import json
import logging
import time
import numpy as np
import pandas as pd
import onnxruntime as ort
import pymysql
import pickle
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from dotenv import load_dotenv

# --- 1. Configuration and Setup ---
load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("RTO_Consumer")

# --- Configs ---
KAFKA_SERVER = os.getenv("KAFKA_BROKER_URL", "kafka:9092")
KAFKA_TOPIC_IN = "sensors-validated" 
DB_CONFIG = {
    "host": os.getenv("DB_HOST"), "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER"), "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_DATABASE"),
}
MODEL_PATH = "artifacts/best_ppo_actor.onnx"
SCALER_PATH = "artifacts/rto_scaler.pkl" 

# --- Model Features ---
# RTO_STATE_FEATURES list is no longer needed here, we get it from the scaler.

def save_suggestion_to_mysql(suggestion: str):
    # ... (This function remains unchanged)
    logger.info(f"Saving suggestion: '{suggestion}' to MySQL...")
    conn = None
    try:
        conn = pymysql.connect(**DB_CONFIG)
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM rto_suggestions")
            sql = "INSERT INTO rto_suggestions (suggestion_text) VALUES (%s)"
            cursor.execute(sql, (suggestion,))
        conn.commit()
        logger.info("✅ Suggestion saved successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to save suggestion to MySQL: {e}")
        raise
    finally:
        if conn:
            conn.close()

def main():
    try:
        # --- 1. Load Model and Scaler ---
        logger.info(f"Loading RTO model from {MODEL_PATH}...")
        session = ort.InferenceSession(MODEL_PATH)
        input_name = session.get_inputs()[0].name
        
        logger.info(f"Loading scaler from {SCALER_PATH}...")
        with open(SCALER_PATH, 'rb') as f:
            scaler = pickle.load(f)
            
    except Exception as e:
        logger.critical(f"❌ Failed to load model or scaler. Exiting. Error: {e}")
        return

    # --- 2. Connect to Kafka ---
    # ... (This section remains unchanged)
    consumer = None
    while not consumer:
        try:
            consumer = KafkaConsumer(
                KAFKA_TOPIC_IN,
                bootstrap_servers=[KAFKA_SERVER],
                auto_offset_reset="latest",
                value_deserializer=lambda x: json.loads(x.decode("utf-8")),
            )
            logger.info(f"✅ RTO Kafka Consumer connected to topic '{KAFKA_TOPIC_IN}'.")
        except NoBrokersAvailable:
            logger.warning(f"Could not connect to Kafka for RTO. Retrying...")
            time.sleep(5)

    # --- 3. Main Processing Loop ---
    logger.info("Listening for validated sensor data to generate optimizations...")
    for message in consumer:
        try:
            data_row = message.value
            
            # --- THIS IS THE FIX for the UserWarning ---
            # Create a DataFrame to preserve feature names for the scaler
            df_point = pd.DataFrame([data_row])
            
            # Get the correct feature names in the correct order from the scaler itself
            feature_names = scaler.get_feature_names_out()
            input_features_df = df_point[feature_names]
            
            # Scale the DataFrame
            input_scaled = scaler.transform(input_features_df).astype(np.float32)
            
            # Predict the optimal action
            prediction = session.run(None, {input_name: input_scaled})[0]
            action_value = prediction[0][0]
            
            # Generate suggestion text
            current_load_factor = data_row.get('Load_Factor', 0.8) # Default to 0.8 if not present
            efficiency_gain = (action_value - current_load_factor) * 10
            suggestion_text = (
                f"Adjust Load Factor to {action_value:.2%} for a potential "
                f"efficiency gain of {efficiency_gain:.1f}%."
            )
            
            # Save the suggestion to the database
            save_suggestion_to_mysql(suggestion_text)

        except KeyError as e:
            logger.warning(f"Skipping message due to missing feature: {e}")
        except Exception as e:
            logging.error(f"An error occurred in the RTO consumer loop: {e}")

if __name__ == "__main__":
    main()