from kafka import KafkaProducer
import json
import time

try:
    producer = KafkaProducer(
        bootstrap_servers='localhost:9092',
        value_serializer=lambda m: json.dumps(m).encode('utf-8')
    )

    sample_data = {
        "temperature": 23.5,
        "humidity": 45.2,
        "pressure": 1013.1
    }

    while True:
        producer.send('sensors-raw', sample_data)
        print("Sent:", sample_data)
        time.sleep(2)

except Exception as e:
    print("Kafka not available. Skipping producer test.")
