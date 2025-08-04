import os
from kafka import KafkaConsumer
from influxdb_client import InfluxDBClient, Point, WriteOptions
from influxdb_client.client.write_api import SYNCHRONOUS
import json
from dotenv import load_dotenv

# --- 1. Configuration ---
# Load credentials from .env file
load_dotenv()

KAFKA_SERVER = 'localhost:9092'
KAFKA_TOPIC = 'sensors-raw'

INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")

def create_kafka_consumer():
    """Creates and returns a Kafka consumer."""
    try:
        consumer = KafkaConsumer(
            KAFKA_TOPIC,
            bootstrap_servers=[KAFKA_SERVER],
            auto_offset_reset='earliest', # Start reading from the beginning of the topic
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )
        print("✅ Kafka Consumer connected successfully.")
        return consumer
    except Exception as e:
        print(f"❌ Could not connect to Kafka: {e}")
        return None

def main():
    """Main function to consume from Kafka and write to InfluxDB."""
    consumer = create_kafka_consumer()
    
    if not consumer:
        return

    # Check if InfluxDB credentials are loaded
    if not all([INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG, INFLUXDB_BUCKET]):
        print("❌ InfluxDB credentials not found in .env file. Please check your configuration.")
        return

    try:
        with InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG) as client:
            # Using batching for better performance
            write_api = client.write_api(write_options=SYNCHRONOUS)
            print(f"✅ InfluxDB client connected. Writing to bucket '{INFLUXDB_BUCKET}'.")
            
            print("Listening for messages from Kafka...")
            for message in consumer:
                data = message.value
                
                # Create a data point for InfluxDB
                point = Point("compressor_metrics") \
                    .tag("status", data.get("Status", "Unknown")) \
                    .time(data.get("Timestamp"))
                
                # Add all other numeric fields
                for key, value in data.items():
                    if key not in ["Timestamp", "Status"] and isinstance(value, (int, float)):
                        point = point.field(key, value)

                # Write the point to InfluxDB
                write_api.write(bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=point)
                print(f"Written message with Time={data.get('Time')} to InfluxDB.")

    except Exception as e:
        print(f"❌ An error occurred: {e}")
    finally:
        if consumer:
            consumer.close()
            print("Kafka consumer closed.")

if __name__ == "__main__":
    main()