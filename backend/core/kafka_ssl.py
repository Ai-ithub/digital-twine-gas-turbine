"""
Kafka SSL/TLS configuration helpers.
Provides utilities for secure Kafka connections.
"""

import os
from typing import Optional, Dict
import ssl
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import KafkaError
import logging

logger = logging.getLogger(__name__)


def get_kafka_ssl_context() -> Optional[ssl.SSLContext]:
    """
    Create SSL context for Kafka connections.
    
    Returns:
        SSL context if certificates are configured, None otherwise
    """
    cert_dir = os.getenv("KAFKA_CERT_DIR", "kafka_certs")
    ca_cert_path = os.path.join(cert_dir, "ca-cert.pem")
    
    # Check if SSL is enabled
    use_ssl = os.getenv("KAFKA_SSL_ENABLED", "false").lower() == "true"
    
    if not use_ssl:
        logger.debug("Kafka SSL is disabled")
        return None
    
    if not os.path.exists(ca_cert_path):
        logger.warning(
            f"Kafka SSL enabled but certificate not found at {ca_cert_path}. "
            "Falling back to insecure connection."
        )
        return None
    
    try:
        context = ssl.create_default_context()
        context.load_verify_locations(ca_cert_path)
        context.check_hostname = False  # For self-signed certs in development
        context.verify_mode = ssl.CERT_REQUIRED
        
        logger.info(f"Kafka SSL context created using certificate: {ca_cert_path}")
        return context
    except Exception as e:
        logger.error(f"Error creating SSL context: {e}")
        return None


def get_kafka_ssl_config() -> Dict:
    """
    Get Kafka SSL configuration dictionary.
    
    Returns:
        Dictionary with SSL configuration
    """
    ssl_context = get_kafka_ssl_context()
    
    if ssl_context:
        return {
            "security_protocol": "SSL",
            "ssl_context": ssl_context,
        }
    else:
        return {}


def create_secure_kafka_consumer(
    topic: str,
    bootstrap_servers: str,
    group_id: str,
    **kwargs
) -> KafkaConsumer:
    """
    Create a secure Kafka consumer with SSL support.
    
    Args:
        topic: Kafka topic name
        bootstrap_servers: Kafka broker addresses
        group_id: Consumer group ID
        **kwargs: Additional KafkaConsumer parameters
        
    Returns:
        Configured KafkaConsumer instance
    """
    ssl_config = get_kafka_ssl_config()
    
    consumer_config = {
        "bootstrap_servers": bootstrap_servers,
        "group_id": group_id,
        "auto_offset_reset": kwargs.get("auto_offset_reset", "earliest"),
        **ssl_config,
        **{k: v for k, v in kwargs.items() if k != "auto_offset_reset"},
    }
    
    try:
        consumer = KafkaConsumer(topic, **consumer_config)
        logger.info(f"Created secure Kafka consumer for topic: {topic}")
        return consumer
    except KafkaError as e:
        logger.error(f"Error creating Kafka consumer: {e}")
        raise


def create_secure_kafka_producer(
    bootstrap_servers: str,
    **kwargs
) -> KafkaProducer:
    """
    Create a secure Kafka producer with SSL support.
    
    Args:
        bootstrap_servers: Kafka broker addresses
        **kwargs: Additional KafkaProducer parameters
        
    Returns:
        Configured KafkaProducer instance
    """
    ssl_config = get_kafka_ssl_config()
    
    producer_config = {
        "bootstrap_servers": bootstrap_servers,
        **ssl_config,
        **kwargs,
    }
    
    try:
        producer = KafkaProducer(**producer_config)
        logger.info("Created secure Kafka producer")
        return producer
    except KafkaError as e:
        logger.error(f"Error creating Kafka producer: {e}")
        raise

