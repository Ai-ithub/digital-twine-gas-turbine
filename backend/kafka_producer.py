import pandas as pd
from kafka import KafkaProducer
import json
import time
import os

# --- Configuration ---
KAFKA_SERVER = 'localhost:9092'
KAFKA_TOPIC = 'sensors-raw'
CSV_FILE_PATH = 'datasets/MASTER_DATASET.csv'

def create_producer():
    """Creates a Kafka Producer instance."""
    try:
        producer = KafkaProducer(
            bootstrap_servers=[KAFKA_SERVER],
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        print("✅ Kafka Producer connected successfully.")
        return producer
    except Exception as e:
        print(f"❌ Could not connect to Kafka server: {e}")
        return None

def stream_data(producer, file_path):
    """Reads data from a CSV and streams it to a Kafka topic."""
    try:
        print(f"Reading data from {file_path}...")
        df = pd.read_csv(file_path)
        print("Starting to stream data to Kafka topic '{}'...".format(KAFKA_TOPIC))
        
        # Loop through each row of the dataframe
        for index, row in df.iterrows():
            # Convert row to dictionary
            message = row.to_dict()
            
            # Send message to Kafka
            producer.send(KAFKA_TOPIC, value=message)
            
            print(f"Sent message #{index + 1}: {message}")
            
            # Wait for 1 second to simulate a real-time stream
            time.sleep(1)
            
        producer.flush() # Ensure all messages are sent
        print("\n✅ Finished streaming all data.")

    except FileNotFoundError:
        print(f"❌ ERROR: The file '{file_path}' was not found.")
    except Exception as e:
        print(f"❌ An error occurred during streaming: {e}")

if __name__ == "__main__":
    # Ensure the script is run from the project's root directory
    # by checking if the 'datasets' folder exists.
    if not os.path.exists('datasets'):
        print("❌ This script must be run from the project's root directory.")
    else:
        kafka_producer = create_producer()
        if kafka_producer:
            stream_data(kafka_producer, CSV_FILE_PATH)
            kafka_producer.close()