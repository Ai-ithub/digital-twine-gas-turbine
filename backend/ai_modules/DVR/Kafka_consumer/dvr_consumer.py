from kafka import KafkaConsumer, KafkaProducer
import json
import numpy as np
from dvr_processor import DVRProcessor
import pandas as pd

# Kafka Consumer to receive raw sensor data
consumer = KafkaConsumer(
    'sensors-raw',
    bootstrap_servers='localhost:9092',
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    auto_offset_reset='earliest',
    enable_auto_commit=True,
    group_id='dvr-group'
)

# Kafka Producer to publish processed (validated) data
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda m: json.dumps(m).encode('utf-8')
)

# Initialize DVRProcessor with sensor validation rules
processor = DVRProcessor(rules_config={
    "temperature": (0, 100),
    "humidity": (0, 100),
    "pressure": (900, 1100)
})

# Consume, process, and forward data in a loop
for message in consumer:
    raw_data = message.value
    print("Received raw:", raw_data)

    # Convert raw JSON data to a pandas DataFrame
    df = pd.DataFrame([raw_data])

    # Apply DVR logic to clean/validate the data
    processed_df = processor.process(df)

    # Convert the processed DataFrame back to dict
    cleaned_data = processed_df.to_dict(orient="records")[0]
    print("Processed and sending:", cleaned_data)

    # Send validated data to the 'sensors-validated' topic
    producer.send('sensors-validated', cleaned_data)
    producer.flush()
