import json
from kafka import KafkaConsumer
from rtm_module import AnomalyDetector # Import our new class

# --- Configuration ---
KAFKA_SERVER = 'localhost:9092'
KAFKA_TOPIC_IN = 'sensors-raw'
# In the future, we will send alerts to a different topic:
# KAFKA_TOPIC_OUT = 'alerts' 

def main():
    """
    Consumes from Kafka, runs anomaly detection, and prints the result.
    """
    try:
        # Initialize our anomaly detector
        detector = AnomalyDetector()
        if not detector.session:
            print("Stopping: Anomaly detector model could not be loaded.")
            return

        # Initialize the Kafka consumer
        consumer = KafkaConsumer(
            KAFKA_TOPIC_IN,
            bootstrap_servers=[KAFKA_SERVER],
            auto_offset_reset='latest', # Process only new messages
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )
        print("✅ RTM Kafka Consumer connected. Listening for new messages...")

        for message in consumer:
            data_row = message.value
            prediction = detector.predict(data_row)
            
            if prediction == -1:
                # In the future, we would send this to the 'alerts' topic
                print(f"🚨 ANOMALY DETECTED! (Time={data_row.get('Time')})")
            else:
                print(f"✅ Data point is Normal. (Time={data_row.get('Time')})")

    except Exception as e:
        print(f"❌ An error occurred in the RTM consumer: {e}")

if __name__ == "__main__":
    main()