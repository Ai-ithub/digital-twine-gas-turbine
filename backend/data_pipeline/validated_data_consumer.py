import os
import json
import logging
import time
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from influxdb_client import InfluxDBClient, Point, WriteOptions

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# --- Load Environment Variables ---
# Kafka Configuration
KAFKA_BROKER_URL = os.getenv("KAFKA_BROKER_URL", "kafka:9092")
VALIDATED_TOPIC_NAME = os.getenv("VALIDATED_TOPIC_NAME", "sensors-validated")

# InfluxDB Configuration
INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET_VALIDATED = "compressor-data-validated"  # The new bucket name


def connect_to_kafka():
    """
    Tries to connect to Kafka in a loop until successful.
    """
    while True:
        try:
            consumer = KafkaConsumer(
                VALIDATED_TOPIC_NAME,
                bootstrap_servers=[KAFKA_BROKER_URL],
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                auto_offset_reset="earliest",
            )
            logging.info(
                f"✅ Successfully connected to Kafka topic: {VALIDATED_TOPIC_NAME}"
            )
            return consumer
        except NoBrokersAvailable:
            logging.warning("Could not connect to Kafka. Retrying in 5 seconds...")
            time.sleep(5)
        except Exception as e:
            logging.error(
                f"An unexpected error occurred while connecting to Kafka: {e}"
            )
            time.sleep(5)


def main():
    """
    Main function to run the consumer.
    It connects to the validated data topic and persists messages to InfluxDB.
    """
    logging.info("Starting the consumer for validated data...")

    # --- Connect to Kafka with retry logic ---
    consumer = connect_to_kafka()
    if not consumer:
        logging.error(
            "Could not establish a connection to Kafka after multiple retries. Exiting."
        )
        return

    # --- Connect to InfluxDB ---
    try:
        influx_client = InfluxDBClient(
            url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG
        )
        # Use SYNCHRONOUS mode to ensure each message is written before proceeding
        write_api = influx_client.write_api(write_options=WriteOptions(batch_size=1))
        logging.info(
            f"Successfully connected to InfluxDB bucket: {INFLUXDB_BUCKET_VALIDATED}"
        )
    except Exception as e:
        logging.error(f"Error connecting to InfluxDB: {e}")
        return

    # --- Main Loop to Process Messages ---
    logging.info("Waiting for messages from Kafka...")
    for message in consumer:
        try:
            data = message.value
            logging.info(f"New message received: {data}")

            point = Point("validated_sensors")

            # Use the 'Timestamp' field for the InfluxDB timestamp
            point.time(data.get("Timestamp"))

            # Iterate through the data and add fields and tags
            for key, value in data.items():
                # Skip the key that we already used for the timestamp
                if key == "Timestamp":
                    continue

                # If the value is a string, add it as a tag
                if isinstance(value, str):
                    point.tag(key, value)
                # If the value is a number (int, float, bool), add it as a field
                elif isinstance(value, (int, float, bool)):
                    point.field(key, value)

            write_api.write(
                bucket=INFLUXDB_BUCKET_VALIDATED, org=INFLUXDB_ORG, record=point
            )
            logging.info("✅ Data point successfully written to InfluxDB.")

        except Exception as e:
            logging.error(f"Error processing message or writing to InfluxDB: {e}")


if __name__ == "__main__":
    main()
