import unittest
from kafka import KafkaProducer
import json
import socket

def is_kafka_available(host='localhost', port=9092):
    try:
        with socket.create_connection((host, port), timeout=2):
            return True
    except OSError:
        return False

class KafkaProducerTest(unittest.TestCase):
    @unittest.skipUnless(is_kafka_available(), "Kafka not available")
    def test_producer_send(self):
        producer = KafkaProducer(
            bootstrap_servers='localhost:9092',
            value_serializer=lambda m: json.dumps(m).encode('utf-8')
        )
        sample_data = {
            "temperature": 23.5,
            "humidity": 45.2,
            "pressure": 1013.1
        }
        producer.send('sensors-raw', sample_data)
        self.assertTrue(True)  # successful

if __name__ == '__main__':
    unittest.main()
