from kafka import KafkaConsumer, KafkaProducer
import json
import pandas as pd
from dvr_processor import DVRProcessor

# Kafka consumer to receive raw messages
consumer = KafkaConsumer(
    'sensors-raw',
    bootstrap_servers='localhost:9092',
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    auto_offset_reset='earliest',
    enable_auto_commit=True,
    group_id='dvr-group'
)

# Kafka producer to send validated data
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda m: json.dumps(m).encode('utf-8')
)

# Initialize processing logic
processor = DVRProcessor()

# Buffer for batch processing
buffer = []
batch_size = 5  # Number of rows per processing window

for message in consumer:
    raw_data = message.value
    print("Received raw:", raw_data)
    buffer.append(raw_data)

    # Process in batches of `batch_size`
    if len(buffer) >= batch_size:
        df = pd.DataFrame(buffer)
        processed_df = processor.run_all_checks(df)

        for _, row in processed_df.iterrows():
            cleaned_data = row.to_dict()
            print("Processed and sending:", cleaned_data)
            producer.send('sensors-validated', cleaned_data)

        producer.flush()
        buffer = []  # Clear buffer for next batch
