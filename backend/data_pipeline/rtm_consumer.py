# backend/data_pipeline/rtm_consumer.py

import json
import logging
import os
import time
import pymysql
import pandas as pd
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable
from backend.ml.rtm_module import AnomalyDetector
from collections import deque
from backend.core.prediction_logger import log_prediction
from dotenv import load_dotenv
from datetime import datetime

# --- 1. Configuration and Setup ---
load_dotenv()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# --- Configs ---
KAFKA_SERVER = os.getenv("KAFKA_BROKER_URL", "kafka:9092")
KAFKA_TOPIC_IN = "sensors-raw"
KAFKA_TOPIC_OUT = "alerts"
WINDOW_SIZE = 5
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_DATABASE"),
}


# --- ۲. تابع جدید برای ذخیره هشدار در دیتابیس ---
def save_alert_to_mysql(alert_data: dict):
    """Saves a new anomaly alert to the 'alarms' table in MySQL."""
    conn = None
    try:
        conn = pymysql.connect(**DB_CONFIG)
        with conn.cursor() as cursor:
            sql = """
                INSERT INTO alarms (time_id, timestamp, alert_type, details)
                VALUES (%s, %s, %s, %s)
            """
            # --- THIS IS THE FIX: Convert ISO 8601 string to a datetime object ---
            timestamp_obj = datetime.fromisoformat(alert_data.get("timestamp").replace('Z', '+00:00'))
            
            cursor.execute(sql, (
                alert_data.get("time_id"),
                timestamp_obj, # Pass the datetime object
                alert_data.get("alert_type"),
                alert_data.get("details")
            ))
        conn.commit()
        logging.info(f"✅ Alert for Time={alert_data.get('time_id')} saved to database.")
    except Exception as e:
        logging.error(f"❌ Failed to save alert to MySQL: {e}")
    finally:
        if conn:
            conn.close()


def connect_to_kafka():
    """Establishes a connection to Kafka Consumer and Producer."""
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
    """Main function to consume sensor data, detect anomalies, and log alerts."""
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

            # Feature Engineering: Rolling window calculations
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

            # Log every prediction to the database
            log_prediction(
                db_config=DB_CONFIG,
                model_version="RandomForest_RTM_v1.0",
                input_data=data_row,
                prediction={"anomaly": int(prediction)},
                latency_ms=latency,
            )

            # If an anomaly is detected, send alert and save to DB
            if prediction == -1:
                alert_message = {
                    "timestamp": data_row.get("Timestamp"),
                    "time_id": data_row.get("Time"),
                    "alert_type": "Anomaly Detected",
                    "details": f"Anomaly found in sensor readings. Vibration: {data_row.get('Vibration')}",
                }
                
                # Send alert to Kafka (as before)
                producer.send(KAFKA_TOPIC_OUT, value=alert_message)
                producer.flush()
                logging.warning(
                    f"🚨 ANOMALY DETECTED and published to '{KAFKA_TOPIC_OUT}'. (Time={data_row.get('Time')})"
                )

                # --- ۳. فراخوانی تابع جدید برای ذخیره هشدار ---
                save_alert_to_mysql(alert_message)

        except Exception as e:
            logging.error(f"An error occurred in the RTM consumer loop: {e}")


if __name__ == "__main__":
    main()