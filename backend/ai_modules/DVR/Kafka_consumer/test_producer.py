import pandas as pd
from kafka import KafkaProducer
import json
import time

# Load dataset
# df = pd.read_csv("C:/Users/98939/Downloads/MASTER_DATASET.csv")
import os
assert os.path.exists("datasets/MASTER_DATASET.csv"), "CSV file not found!"

df = pd.read_csv("datasets/MASTER_DATASET.csv")

required_columns = [
    'Pressure_In', 'Temperature_In', 'Flow_Rate', 'Pressure_Out',
    'Efficiency', 'Vibration', 'Ambient_Temperature', 'Power_Consumption'
]

missing = [col for col in required_columns if col not in df.columns]
if missing:
    raise ValueError(f"Missing columns in CSV: {missing}")


# Filter required columns
# required_columns = [
#     'Pressure_In',
#     'Temperature_In',
#     'Flow_Rate',
#     'Pressure_Out',
#     'Efficiency',
#     'Vibration',
#     'Ambient_Temperature',
#     'Power_Consumption'
# ]
# df = df[required_columns].dropna()

# Setup Kafka producer
producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Stream each row as an individual Kafka message
for idx, row in df.iterrows():
    data = row.to_dict()
    print(f"Sending row {idx}: {data}")
    producer.send('sensors-raw', value=data)
    producer.flush()
    time.sleep(1)  # Simulate real-time by adding delay
