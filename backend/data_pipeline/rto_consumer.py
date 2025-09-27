# backend/data_pipeline/rto_consumer.py

import os
import json
import logging
import time
import numpy as np
import pandas as pd
import onnxruntime as ort
import pymysql
import pickle
# Add KafkaProducer
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable
from dotenv import load_dotenv
from backend.core import config

# --- 1. Setup Logging and Load Env ---
load_dotenv()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("RTO_Consumer")

# --- 2. Use Config Variables ---
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_DATABASE"),
}


def save_suggestion_to_mysql(suggestion: str):
    # This function remains unchanged
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
        # Use Config Variables for Model Paths and Features
        logger.info(f"Loading RTO model from {config.RTO_MODEL_PATH}...")
        session = ort.InferenceSession(config.RTO_MODEL_PATH)
        input_name = session.get_inputs()[0].name

        logger.info(f"Loading scaler from {config.RTO_SCALER_PATH}...")
        with open(config.RTO_SCALER_PATH, "rb") as f:
            scaler = pickle.load(f)

    except Exception as e:
        logger.critical(f"❌ Failed to load model or scaler. Exiting. Error: {e}")
        return

    # --- Connect to Kafka Consumer & Producer ---
    consumer = None
    producer = None
    kafka_server = os.getenv("KAFKA_BROKER_URL", "kafka:9092")
    
    while not consumer or not producer:
        try:
            if not consumer:
                consumer = KafkaConsumer(
                    config.KAFKA_VALIDATED_TOPIC,
                    bootstrap_servers=[kafka_server],
                    auto_offset_reset="latest",
                    value_deserializer=lambda x: json.loads(x.decode("utf-8")),
                )
                logger.info(f"✅ RTO Kafka Consumer connected.")
            
            if not producer:
                producer = KafkaProducer(
                    bootstrap_servers=[kafka_server],
                    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                )
                logger.info(f"✅ RTO Kafka Producer connected.")

        except NoBrokersAvailable:
            logger.warning("Could not connect to Kafka. Retrying...")
            time.sleep(5)

    logger.info("Listening for validated sensor data to generate optimizations...")
    for message in consumer:
        try:
            data_row = message.value
            df_point = pd.DataFrame([data_row])

            # Use feature list from config
            feature_names = scaler.get_feature_names_out()
            input_features_df = df_point[feature_names]

            input_scaled = scaler.transform(input_features_df).astype(np.float32)

            prediction = session.run(None, {input_name: input_scaled})[0]
            action_value = prediction[0][0]

            current_load_factor = data_row.get("Load_Factor", 0.8)
            efficiency_gain = (action_value - current_load_factor) * 10
            suggestion_text = (
                f"Adjust Load Factor to {action_value:.2%} for a potential "
                f"efficiency gain of {efficiency_gain:.1f}%."
            )

            # 1. Save to DB (as before)
            save_suggestion_to_mysql(suggestion_text)

            # 2. NEW: Produce to Kafka topic for real-time push
            rto_payload = {
                "suggestion_text": suggestion_text,
                "generated_at": pd.Timestamp.now(tz='UTC').isoformat() # Add timestamp
            }
            producer.send(config.KAFKA_RTO_SUGGESTIONS_TOPIC, value=rto_payload)
            producer.flush()
            logger.info(f"✅ Suggestion sent to Kafka topic '{config.KAFKA_RTO_SUGGESTIONS_TOPIC}'.")


        except KeyError as e:
            logger.warning(f"Skipping message due to missing feature: {e}")
        except Exception as e:
            logging.error(f"An error occurred in the RTO consumer loop: {e}")


if __name__ == "__main__":
    main()