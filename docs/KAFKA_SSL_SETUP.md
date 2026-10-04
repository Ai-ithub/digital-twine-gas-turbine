# Kafka SSL/TLS Setup Guide

This guide describes how to configure SSL/TLS for Kafka.

## 📋 Prerequisites

- OpenSSL
- Java keytool (for generating keystores)

## 🔐 Generating Certificates

### Step 1: Run the Certificate Generation Script

```bash
chmod +x scripts/generate_kafka_certs.sh
./scripts/generate_kafka_certs.sh
```

This script generates the following:
- `kafka_certs/ca-cert.pem` - CA certificate (for clients)
- `kafka_certs/kafka.server.keystore.jks` - Server keystore
- `kafka_certs/kafka.server.truststore.jks` - Server truststore
- `kafka_certs/kafka.client.truststore.jks` - Client truststore

### Step 2: Enable SSL in Kafka

Add to the `.env` file:

```env
KAFKA_SSL_ENABLED=true
KAFKA_CERT_DIR=kafka_certs
KAFKA_INTER_BROKER_LISTENER=SSL  # to use SSL between brokers
```

### Step 3: Configure docker-compose

The SSL options in `docker-compose.yml` are marked with comments. To enable:

1. Uncomment the SSL environment variables in the Kafka service
2. Make sure the certificates volume is mounted

## 🔧 Use in Python Clients

### Using the Secure Producer

```python
from backend.core.kafka_ssl import create_secure_kafka_producer

producer = create_secure_kafka_producer(
    bootstrap_servers="kafka:9093",  # Use SSL port
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)
```

### Using the Secure Consumer

```python
from backend.core.kafka_ssl import create_secure_kafka_consumer

consumer = create_secure_kafka_consumer(
    topic="sensors-raw",
    bootstrap_servers="kafka:9093",  # Use SSL port
    group_id="my-group"
)
```

## ⚠️ Security Notes

1. **Development vs Production:**
   - The generated certificates are self-signed and suitable only for development
   - For production, use real certificates from a CA

2. **Password Management:**
   - In production, keep passwords in environment variables
   - Never hard-code passwords in code

3. **Certificate Rotation:**
   - Certificates must be rotated periodically
   - Have a plan for certificate renewal

## 🧪 Testing the SSL Connection

```python
from backend.core.kafka_ssl import get_kafka_ssl_context

ssl_ctx = get_kafka_ssl_context()
if ssl_ctx:
    print("SSL is configured correctly")
else:
    print("SSL is not configured or disabled")
```

## 📝 Migration Guide

To migrate existing consumers to SSL:

1. Set `KAFKA_SSL_ENABLED=true` in `.env`
2. Change Producer/Consumer creation to the `create_secure_kafka_*` functions
3. Change the Port from `9092` to `9093`
4. Test and make sure the connection is established

## 🐛 Troubleshooting

### Problem: "SSL handshake failed"
- Check that the certificates are in the correct path
- Make sure port 9093 is open

### Problem: "Certificate verification failed"
- For development, `check_hostname=False` is set in the SSL context
- In production, hostname verification must be enabled

### Problem: "Kafka broker not available"
- Check that Kafka started with SSL listeners
- Check the Kafka logs

