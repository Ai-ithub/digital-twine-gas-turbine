import json
import logging
import os
import time
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable
from backend.ml.rtm_module import AnomalyDetector

# --- Setup Logging ---
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# --- Configuration ---
KAFKA_SERVER = os.getenv("KAFKA_BROKER_URL", "kafka:9092")
KAFKA_TOPIC_IN = "sensors-raw"
KAFKA_TOPIC_OUT = "alerts"


def connect_to_kafka():
    """Tries to connect to Kafka in a loop until successful."""
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
        except Exception as e:
            logging.error(
                f"An unexpected error occurred while connecting to Kafka: {e}"
            )
            time.sleep(5)


def main():
    """Consumes from Kafka, runs anomaly detection, and publishes alerts."""
    detector = AnomalyDetector()
    if not detector.session:
        logging.critical(
            "Stopping RTM consumer: Anomaly detector model could not be loaded."
        )
        return

    consumer, producer = connect_to_kafka()

    logging.info("Listening for messages to analyze...")

    for message in consumer:
        try:
            data_row = message.value
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
                logging.warning(
                    f"🚨 ANOMALY DETECTED and published to '{KAFKA_TOPIC_OUT}'. (Time={data_row.get('Time')})"
                )
        except Exception as e:
            logging.error(f"An error occurred in the RTM consumer loop: {e}")


if __name__ == "__main__":
    main()
