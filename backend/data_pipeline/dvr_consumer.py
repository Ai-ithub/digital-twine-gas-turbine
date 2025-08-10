import os
import json
import logging # NEW: Import logging module
import pandas as pd
from ml.dvr_processor import DVRProcessor
from kafka import KafkaConsumer, KafkaProducer
from dotenv import load_dotenv

# --- 1. Configuration and Setup ---
load_dotenv()

# NEW: Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Kafka Configuration
KAFKA_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
GROUP_ID = os.getenv("KAFKA_DVR_GROUP_ID", "dvr-group")
RAW_TOPIC = 'sensors-raw'
VALIDATED_TOPIC = 'sensors-validated'

# Processing Configuration
BATCH_SIZE = 5

# --- 2. Initialize Components ---
try:
    # CHANGED: We now handle deserialization manually inside the loop
    consumer = KafkaConsumer(
        RAW_TOPIC,
        bootstrap_servers=KAFKA_SERVERS,
        auto_offset_reset='earliest',
        enable_auto_commit=False,  # CHANGED: Disable auto-commit for manual control
        group_id=GROUP_ID
    )

    producer = KafkaProducer(
        bootstrap_servers=KAFKA_SERVERS,
        value_serializer=lambda m: json.dumps(m).encode('utf-8')
    )
    
    processor = DVRProcessor()
    logger.info("Kafka consumer and producer initialized successfully.")

except Exception as e:
    logger.critical(f"Failed to initialize Kafka client. Exiting. Error: {e}")
    exit(1) # Exit if we can't even connect to Kafka

# --- 3. Main Processing Loop ---
buffer = []
logger.info(f"Starting DVR consumer for topic '{RAW_TOPIC}' with batch size {BATCH_SIZE}...")

for message in consumer:
    try:
        # NEW: Manually deserialize JSON inside a try-except block
        raw_data = json.loads(message.value.decode('utf-8'))
        logger.debug(f"Received raw message: {raw_data}") # Use debug for verbose logs
        buffer.append(raw_data)

    except json.JSONDecodeError:
        logger.warning(f"Skipping message with invalid JSON: {message.value}")
        continue # Skip to the next message

    # Process in batches
    if len(buffer) >= BATCH_SIZE:
        try:
            logger.info(f"Processing a batch of {len(buffer)} records...")
            df = pd.DataFrame(buffer)
            processed_df = processor.run_all_checks(df)

            # Send processed data to the new topic
            for _, row in processed_df.iterrows():
                cleaned_data = row.to_dict()
                logger.debug(f"Producing validated message: {cleaned_data}")
                producer.send(VALIDATED_TOPIC, cleaned_data)

            # Flush the producer to ensure all messages are sent
            producer.flush()
            
            # NEW: Manually commit the offset after successful processing and producing
            consumer.commit()
            
            logger.info(f"Successfully processed and committed a batch of {len(buffer)} records.")

        except Exception as e:
            # NEW: Catch any error during processing and log it
            logger.error(f"Failed to process a batch. Error: {e}")
            logger.error(f"Problematic data batch: {buffer}")
            # The offset is NOT committed, so this batch will be re-processed later.
        
        finally:
            # NEW: Always clear the buffer, whether it succeeded or failed
            buffer = []