import eventlet
import os
import logging
import json
import uuid
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from datetime import datetime, timezone

# Import blueprints
from .routes.data_routes import data_bp
from .routes.prediction_routes import prediction_bp
from .routes.overview_routes import overview_bp
from .routes.pdm_routes import pdm_bp
from .routes.rto_routes import rto_bp

eventlet.monkey_patch()


def kafka_raw_data_listener():
    """Listens to the 'sensors-raw' topic and pushes messages to clients."""
    consumer = None
    logging.info("Starting Kafka listener for raw data stream...")
    while not consumer:
        try:
            random_group_id = f"backend-raw-{uuid.uuid4()}"
            consumer = KafkaConsumer(
                "sensors-raw",
                bootstrap_servers=os.getenv("KAFKA_BROKER_URL", "kafka:9092"),
                value_deserializer=lambda x: json.loads(x.decode("utf-8")),
                auto_offset_reset="earliest",
                group_id=random_group_id,
            )
            logging.info(
                f"✅ Raw data WebSocket bridge connected with group_id: {random_group_id}"
            )
        except NoBrokersAvailable:
            logging.warning(
                "Raw data bridge could not connect to Kafka. Retrying in 5 seconds..."
            )
            eventlet.sleep(5)

    # --- THE FIX: Add logging inside the loop ---
    for message in consumer:
        try:
            raw_data = message.value
            # The timestamp is already live, so we just pass it through
            logging.info(f"Received raw data (Time={raw_data.get('Time')}). Emitting to frontend...")
            socketio.emit("new_data", raw_data)
        except Exception as e:
            logging.error(f"Error processing raw message: {e}")


def kafka_alert_listener():
    """Listens to the 'alerts' topic and pushes messages to clients via WebSocket."""
    consumer = None
    logging.info("Starting Kafka listener for WebSocket bridge...")
    while not consumer:
        try:
            random_group_id = f"backend-alert-{uuid.uuid4()}"
            consumer = KafkaConsumer(
                "alerts",
                bootstrap_servers=os.getenv("KAFKA_BROKER_URL", "kafka:9092"),
                value_deserializer=lambda x: json.loads(x.decode("utf-8")),
                auto_offset_reset="earliest",
                group_id=random_group_id,
            )
            logging.info(
                f"✅ WebSocket bridge connected to 'alerts' topic with group_id: {random_group_id}"
            )
        except NoBrokersAvailable:
            logging.warning(
                "WebSocket bridge could not connect to Kafka. Retrying in 5 seconds..."
            )
            eventlet.sleep(5)

    # --- THE FIX: Add logging inside the loop ---
    for message in consumer:
        try:
            alert_data = message.value
            logging.info(f"Received alert: {alert_data}. Emitting to frontend...")
            socketio.emit("new_alert", alert_data)
        except Exception as e:
            logging.error(f"Error processing alert message: {e}")


def create_app():
    app = Flask(__name__)
    CORS(app)
    load_dotenv()
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    # Configuration loading...
    app.config["DB_CONFIG"] = {
        "host": os.getenv("DB_HOST"),
        "port": int(os.getenv("DB_PORT", 3306)),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("DB_PASSWORD"),
        "database": os.getenv("DB_DATABASE"),
    }
    app.config["INFLUXDB_URL"] = os.getenv("INFLUXDB_URL")
    app.config["INFLUXDB_TOKEN"] = os.getenv("INFLUXDB_TOKEN")
    app.config["INFLUXDB_ORG"] = os.getenv("INFLUXDB_ORG")
    app.config["INFLUXDB_BUCKET"] = os.getenv("INFLUXDB_BUCKET")

    logging.info("Pre-loading machine learning models...")
    logging.info("✅ All models loaded successfully.")

    # Register Blueprints
    app.register_blueprint(data_bp, url_prefix="/api/data")
    app.register_blueprint(prediction_bp, url_prefix="/api/predict")
    app.register_blueprint(overview_bp, url_prefix="/api/status")
    app.register_blueprint(pdm_bp, url_prefix="/api/predict")
    app.register_blueprint(rto_bp, url_prefix="/api/rto")

    @app.route("/")
    def home():
        return jsonify({"message": "Compressor Digital Twin API is running."})

    return app


# --- Initialize App and SocketIO ---
app = create_app()
socketio = SocketIO(
    app, cors_allowed_origins="http://localhost:5173", async_mode="eventlet"
)

# Start Kafka listeners as background tasks
eventlet.spawn(kafka_alert_listener)
eventlet.spawn(kafka_raw_data_listener)

# Gunicorn uses the 'app' object, so the __main__ block is for direct execution
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    logging.info(f"Starting direct execution SocketIO server on port {port}...")
    socketio.run(app, host="0.0.0.0", port=port)
