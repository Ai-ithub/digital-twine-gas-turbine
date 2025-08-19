import eventlet
import os
import sys
import logging
import json
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from .routes.data_routes import data_bp
from .routes.prediction_routes import prediction_bp

eventlet.monkey_patch()


def kafka_raw_data_listener():
    """Listens to the 'sensors-raw' topic and pushes messages to clients."""
    consumer = None
    logging.info("Starting Kafka listener for raw data stream...")
    while not consumer:
        try:
            consumer = KafkaConsumer(
                "sensors-raw",
                bootstrap_servers=os.getenv("KAFKA_BROKER_URL", "kafka:9092"),
                value_deserializer=lambda x: json.loads(x.decode("utf-8")),
                auto_offset_reset="latest",
            )
            logging.info(
                "✅ Raw data WebSocket bridge connected to 'sensors-raw' topic."
            )
        except NoBrokersAvailable:
            logging.warning(
                "Raw data bridge could not connect to Kafka. Retrying in 5 seconds..."
            )
            eventlet.sleep(5)

    for message in consumer:
        raw_data = message.value
        # Emit raw data on a different event, e.g., 'new_data'
        socketio.emit("new_data", raw_data)


def create_app():
    """Creates and configures the Flask application."""
    app = Flask(__name__)
    # CORS is now handled by SocketIO, but we can keep it for regular HTTP routes
    CORS(app)
    load_dotenv()
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    # --- Load Configuration ---
    # (Your configuration loading logic remains the same)
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

    # --- Pre-load ML Models ---
    # (Your model loading logic remains the same)
    try:
        logging.info("Pre-loading machine learning models...")
        # ...
        logging.info("✅ All models loaded successfully.")
    except Exception as e:
        logging.critical(
            f"❌ Critical error: Failed to load ML models on startup. Error: {e}"
        )
        sys.exit(1)

    # --- Register Blueprints ---
    app.register_blueprint(data_bp, url_prefix="/data")
    app.register_blueprint(prediction_bp, url_prefix="/predict")

    @app.route("/")
    def home():
        return jsonify({"message": "Compressor Digital Twin API is running."})

    return app


# --- Initialize App and SocketIO ---
app = create_app()
# The frontend URL is explicitly allowed to handle CORS for WebSocket
socketio = SocketIO(
    app, cors_allowed_origins="http://localhost:5173", async_mode="eventlet"
)


# --- Kafka Consumer for Alerts (Background Task) ---
def kafka_alert_listener():
    """Listens to the 'alerts' topic and pushes messages to clients via WebSocket."""
    consumer = None
    logging.info("Starting Kafka listener for WebSocket bridge...")
    while not consumer:
        try:
            consumer = KafkaConsumer(
                "alerts",
                bootstrap_servers=os.getenv("KAFKA_BROKER_URL", "kafka:9092"),
                value_deserializer=lambda x: json.loads(x.decode("utf-8")),
                auto_offset_reset="latest",
            )
            logging.info("✅ WebSocket bridge connected to 'alerts' topic.")
        except NoBrokersAvailable:
            logging.warning(
                "WebSocket bridge could not connect to Kafka. Retrying in 5 seconds..."
            )
            eventlet.sleep(5)

    for message in consumer:
        alert_data = message.value
        logging.info(
            f"WebSocket bridge received alert: {alert_data}, pushing to clients..."
        )
        socketio.emit("new_alert", alert_data)


# --- Main Execution Block ---
if __name__ == "__main__":
    # Start the Kafka listener as a background GreenThread
    eventlet.spawn(kafka_alert_listener)
    eventlet.spawn(kafka_raw_data_listener)

    # Run the app using the SocketIO server
    port = int(os.getenv("PORT", 5000))
    logging.info(f"Starting SocketIO server on port {port}...")
    socketio.run(app, host="0.0.0.0", port=port)
