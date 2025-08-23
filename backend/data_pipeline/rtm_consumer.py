# backend/data_pipeline/rtm_consumer.py (Upgraded for Live Feature Engineering)

import json
import logging
import os
import time
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable
from backend.ml.rtm_module import AnomalyDetector
import pandas as pd
from collections import deque # <-- For creating a data buffer

# --- Setup Logging ---
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# --- Configuration ---
KAFKA_SERVER = os.getenv("KAFKA_BROKER_URL", "kafka:9092")
KAFKA_TOPIC_IN = "sensors-raw"
KAFKA_TOPIC_OUT = "alerts"
WINDOW_SIZE = 5 # Must match the window size used in the notebook

def connect_to_kafka():
    # ... (This function remains unchanged)
    while True:
        try:
            consumer = KafkaConsumer(
                KAFKA_TOPIC_IN,
                bootstrap_servers=[KAFKA_SERVER],
                auto_offset_reset="latest", # For live monitoring, 'latest' is correct
                value_deserializer=lambda x: json.loads(x.decode("utf-8")),
            )
            producer = KafkaProducer(
                bootstrap_servers=[KAFKA_SERVER],
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            )
            logging.info("✅ RTM Kafka Consumer and Producer connected successfully.")
            return consumer, producer
        except NoBrokersAvailable:
            logging.warning("Could not connect to Kafka for RTM. Retrying in 5 seconds...")
            time.sleep(5)

def main():
    detector = AnomalyDetector()
    if not detector.session:
        logging.critical("Stopping RTM consumer: Anomaly detector model could not be loaded.")
        return

    consumer, producer = connect_to_kafka()
    logging.info("Listening for messages to analyze...")

    # --- THIS IS THE NEW LOGIC ---
    # Create a buffer (deque) to hold the last WINDOW_SIZE data points
    data_buffer = deque(maxlen=WINDOW_SIZE)

    for message in consumer:
        try:
            data_row = message.value
            
            # Append new data row to our buffer
            data_buffer.append(data_row)
            
            # We can only start predicting when the buffer is full
            if len(data_buffer) < WINDOW_SIZE:
                logging.info(f"Buffer is filling up... ({len(data_buffer)}/{WINDOW_SIZE})")
                continue

            # Convert the buffer to a pandas DataFrame to calculate rolling features
            df_window = pd.DataFrame(list(data_buffer))
            
            # Calculate the rolling features for the LATEST data point
            last_row_index = len(df_window) - 1
            data_row['Vibration_roll_mean'] = df_window['Vibration'].rolling(window=WINDOW_SIZE).mean().iloc[last_row_index]
            data_row['Power_Consumption_roll_mean'] = df_window['Power_Consumption'].rolling(window=WINDOW_SIZE).mean().iloc[last_row_index]
            data_row['Vibration_roll_std'] = df_window['Vibration'].rolling(window=WINDOW_SIZE).std().iloc[last_row_index]
            data_row['Power_Consumption_roll_std'] = df_window['Power_Consumption'].rolling(window=WINDOW_SIZE).std().iloc[last_row_index]

            # Now, data_row has all 20 features and we can send it to the model
            prediction = detector.predict(data_row)

            if prediction == -1:
                alert_message = {
                    "timestamp": data_row.get("Timestamp"),
                    "time_id": data_row.get("Time"),
                    "alert_type": "Anomaly Detected",
                    "details": f"Anomaly found in sensor readings. Vibration: {data_row.get('Vibration')}",
                }
                producer.send(KAFKA_TOPIC_OUT, value=alert_message)
                producer.flush()
                logging.warning(f"🚨 ANOMALY DETECTED and published to '{KAFKA_TOPIC_OUT}'. (Time={data_row.get('Time')})")

        except Exception as e:
            logging.error(f"An error occurred in the RTM consumer loop: {e}")

if __name__ == "__main__":
    main()