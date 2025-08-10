import unittest
import pandas as pd
from kafka import KafkaProducer
import json
import time
import os
import socket

def is_kafka_available(host='localhost', port=9092):
    try:
        with socket.create_connection((host, port), timeout=2):
            return True
    except OSError:
        return False

class TestKafkaProducer(unittest.TestCase):
    @unittest.skipUnless(is_kafka_available(), "Kafka is not available")
    def test_send_data(self):
        assert os.path.exists("backend/ai_modules/DVR/Kafka_consumer/kafka_test_sample.csv"), "CSV file not found!"
        df = pd.read_csv("backend/ai_modules/DVR/Kafka_consumer/kafka_test_sample.csv")
        print("CSV columns:", df.columns.tolist())

        required_columns = [
            'Pressure_In', 'Temperature_In', 'Flow_Rate', 'Pressure_Out',
            'Efficiency', 'Vibration', 'Ambient_Temperature', 'Power_Consumption'
        ]

        missing = [col for col in required_columns if col not in df.columns]
        if missing:
            raise ValueError(f"Missing columns in CSV: {missing}")

        df = df[required_columns].dropna()

        producer = KafkaProducer(
            bootstrap_servers='localhost:9092',
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )

        for idx, row in df.iterrows():
            data = row.to_dict()
            print(f"Sending row {idx}: {data}")
            producer.send('sensors-raw', value=data)
            producer.flush()
            time.sleep(1)
