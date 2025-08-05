import json
from kafka import KafkaConsumer, KafkaProducer
from rtm_module import AnomalyDetector

# --- Configuration ---
KAFKA_SERVER = 'localhost:9092'
KAFKA_TOPIC_IN = 'sensors-raw'
KAFKA_TOPIC_OUT = 'alerts' # The new topic for our alerts

def main():
    """
    Consumes from Kafka, runs anomaly detection, and publishes alerts to a new topic.
    """
    try:
        detector = AnomalyDetector()
        if not detector.session:
            print("Stopping: Anomaly detector model could not be loaded.")
            return

        consumer = KafkaConsumer(
            KAFKA_TOPIC_IN,
            bootstrap_servers=[KAFKA_SERVER],
            auto_offset_reset='latest',
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )
        
        # NEW: Initialize the Kafka producer for sending alerts
        producer = KafkaProducer(
            bootstrap_servers=[KAFKA_SERVER],
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        
        print("✅ RTM Kafka Consumer connected. Listening for messages to analyze...")

        for message in consumer:
            data_row = message.value
            prediction = detector.predict(data_row)
            
            if prediction == -1:
                # NEW: If an anomaly is detected, create an alert message
                alert_message = {
                    "timestamp": data_row.get("Timestamp"),
                    "time_id": data_row.get("Time"),
                    "alert_type": "Anomaly Detected",
                    "details": f"Anomaly found in sensor readings. Vibration: {data_row.get('Vibration')}"
                }
                # NEW: Publish the alert to the 'alerts' topic
                producer.send(KAFKA_TOPIC_OUT, value=alert_message)
                producer.flush()
                print(f"🚨 ANOMALY DETECTED and published to '{KAFKA_TOPIC_OUT}'. (Time={data_row.get('Time')})")
            # We don't need to print anything for normal points
            # else:
            #     print(f"✅ Data point is Normal. (Time={data_row.get('Time')})")

    except Exception as e:
        print(f"❌ An error occurred in the RTM consumer: {e}")

if __name__ == "__main__":
    main()