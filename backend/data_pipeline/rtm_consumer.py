# backend/data_pipeline/rtm_consumer.py

import json
import logging
import os
import time
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable
from backend.ml.rtm_module import AnomalyDetector
import pandas as pd
from collections import deque
from backend.core.prediction_logger import log_prediction
from dotenv import load_dotenv  # <-- Import load_dotenv

# --- 1. Configuration and Setup ---
load_dotenv()  # <-- Load variables from .env file
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# --- Kafka Config ---
KAFKA_SERVER = os.getenv("KAFKA_BROKER_URL", "kafka:9092")
KAFKA_TOPIC_IN = "sensors-raw"
KAFKA_TOPIC_OUT = "alerts"
WINDOW_SIZE = 5

# --- THIS IS THE FIX: Define DB_CONFIG ---
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_DATABASE"),
}


def connect_to_kafka():
    # ... (This function remains unchanged)
    while True:
        try:
            consumer = KafkaConsumer(
                KAFKA_TOPIC_IN,
                bootstrap_servers=[KAFKA_SERVER],
                auto_offset_reset="latest",
                value_deserializer=lambda x: json.loads(x.decode("utf-8")),
            )
            producer = KafkaProducer(
                bootstrap_servers=[KAFKA_SERVER],
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            )
            logging.info("✅ RTM Kafka Consumer and Producer connected successfully.")
            return consumer, producer
        except NoBrokersAvailable:
            logging.warning(
                "Could not connect to Kafka for RTM. Retrying in 5 seconds..."
            )
            time.sleep(5)


def main():
    detector = AnomalyDetector()
    if not detector.session:
        logging.critical(
            "Stopping RTM consumer: Anomaly detector model could not be loaded."
        )
        return

    consumer, producer = connect_to_kafka()
    logging.info("Listening for messages to analyze...")

    data_buffer = deque(maxlen=WINDOW_SIZE)

    for message in consumer:
        try:
            start_time = time.time()
            data_row = message.value
            data_buffer.append(data_row)

            if len(data_buffer) < WINDOW_SIZE:
                logging.info(
                    f"Buffer is filling up... ({len(data_buffer)}/{WINDOW_SIZE})"
                )
                continue

            df_window = pd.DataFrame(list(data_buffer))

            last_row_index = len(df_window) - 1
            data_row["Vibration_roll_mean"] = (
                df_window["Vibration"]
                .rolling(window=WINDOW_SIZE)
                .mean()
                .iloc[last_row_index]
            )
            data_row["Power_Consumption_roll_mean"] = (
                df_window["Power_Consumption"]
                .rolling(window=WINDOW_SIZE)
                .mean()
                .iloc[last_row_index]
            )
            data_row["Vibration_roll_std"] = (
                df_window["Vibration"]
                .rolling(window=WINDOW_SIZE)
                .std()
                .iloc[last_row_index]
            )
            data_row["Power_Consumption_roll_std"] = (
                df_window["Power_Consumption"]
                .rolling(window=WINDOW_SIZE)
                .std()
                .iloc[last_row_index]
            )

            prediction = detector.predict(data_row)
            latency = (time.time() - start_time) * 1000

            # Now DB_CONFIG is defined and can be passed
            log_prediction(
                db_config=DB_CONFIG,
                model_version="RandomForest_RTM_v1.0",
                input_data=data_row,
                prediction={"anomaly": int(prediction)},
                latency_ms=latency,
            )

            if prediction == -1:
                alert_message = {
                    "timestamp": data_row.get("Timestamp"),
                    "time_id": data_row.get("Time"),
                    "alert_type": "Anomaly Detected",
                    "details": f"Anomaly found in sensor readings. Vibration: {data_row.get('Vibration')}",
                }
                producer.send(KAFKA_TOPIC_OUT, value=alert_message)
                producer.flush()
                logging.warning(
                    f"🚨 ANOMALY DETECTED and published to '{KAFKA_TOPIC_OUT}'. (Time={data_row.get('Time')})"
                )

        except Exception as e:
            logging.error(f"An error occurred in the RTM consumer loop: {e}")


if __name__ == "__main__":
    main()
