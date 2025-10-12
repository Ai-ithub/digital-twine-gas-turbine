# backend/data_pipeline/kafka_consumer_influx.py

import os
import json
import logging
import time
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from dotenv import load_dotenv

# --- 1. Configuration and Setup ---
load_dotenv()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Kafka Configuration
KAFKA_SERVER = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
# FIX: CONSUME BOTH RAW AND VALIDATED TOPICS
KAFKA_TOPICS = ["sensors-raw", "sensors-validated"] 
GROUP_ID = "influxdb-writer-group"

# InfluxDB Configuration
INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")


def main():
    """Main function to consume from Kafka and write to InfluxDB."""
    if not all([INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG, INFLUXDB_BUCKET]):
        logger.critical("❌ InfluxDB credentials not found in .env file. Exiting.")
        return

    # --- FIX: Update consumer initialization to use all topics
    consumer = None
    while not consumer:
        try:
            # FIX: Pass the list of topics
            consumer = KafkaConsumer(
                *KAFKA_TOPICS,
                bootstrap_servers=[KAFKA_SERVER],
                auto_offset_reset="earliest",
                enable_auto_commit=False,
                group_id=GROUP_ID,
            )
            logger.info(f"✅ Kafka Consumer for InfluxDB connected successfully. Consuming: {KAFKA_TOPICS}")
        except NoBrokersAvailable:
            logger.warning(
                "Could not connect to Kafka for InfluxDB writer. Retrying in 5 seconds..."
            )
            time.sleep(5)
        except Exception as e:
            logger.error(f"An unexpected error occurred while connecting to Kafka: {e}")
            time.sleep(5)

    try:
        with InfluxDBClient(
            url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG
        ) as client:
            write_api = client.write_api(write_options=SYNCHRONOUS)
            logger.info(
                f"✅ InfluxDB client connected. Writing to bucket '{INFLUXDB_BUCKET}'."
            )

            logger.info(f"Listening for messages from topics: {KAFKA_TOPICS}...")
            for message in consumer:
                try:
                    data = json.loads(message.value.decode("utf-8"))
                    
                    # FIX: Determine measurement name based on the Kafka topic
                    if message.topic == "sensors-validated":
                        measurement = "validated_sensors"
                    else:
                        measurement = "compressor_metrics" # Default for 'sensors-raw'

                    point = (
                        Point(measurement) # Use determined measurement
                        .tag("status", data.get("Status", "Unknown"))
                        .time(data.get("Timestamp"))
                    )

                    for key, value in data.items():
                        if key.lower() not in [
                            "timestamp",
                            "status",
                            "device_id",
                        ] and isinstance(value, (int, float, bool)): # Added bool for compatibility
                            point = point.field(key, value)
                            
                    # FIX: Handle cases where 'Time' is used instead of 'Timestamp'
                    if 'Time' in data and not data.get('Timestamp'):
                        point = point.time(data.get("Time"))


                    write_api.write(
                        bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=point
                    )
                    logger.debug(
                        f"Written message to '{measurement}' with Time={data.get('Timestamp') or data.get('Time')}."
                    )
                    consumer.commit()

                except json.JSONDecodeError:
                    logger.warning(
                        f"Skipping message with invalid JSON: {message.value}"
                    )
                    consumer.commit()
                except Exception as e:
                    logger.error(
                        f"❌ Failed to process message. Error: {e}. Data: {message.value}"
                    )

    except Exception as e:
        logger.critical(f"❌ A critical error occurred in the main loop: {e}")
    finally:
        if consumer:
            consumer.close()
        logger.info("Kafka consumer closed.")


if __name__ == "__main__":
    main()