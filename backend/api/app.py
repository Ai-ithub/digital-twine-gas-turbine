import eventlet
import os
import logging
import json
import uuid
# Imports needed for Kafka/Configuration
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from backend.core import config
# REMOVED: Imports for model loading logic (pickle, numpy, ONNXPredictor)

eventlet.monkey_patch()


# --- Kafka Listener Functions ---
def kafka_processed_data_listener():
    """Listens to the 'sensors-processed' topic (from RTM Consumer) and pushes messages to clients."""
    consumer = None
    PROCESSED_DATA_TOPIC = "sensors-processed"

    logging.info(f"Starting Kafka listener for {PROCESSED_DATA_TOPIC} stream...")
    while not consumer:
        try:
            random_group_id = f"backend-processed-{uuid.uuid4()}"
            consumer = KafkaConsumer(
                PROCESSED_DATA_TOPIC,
                bootstrap_servers=os.getenv("KAFKA_BROKER_URL", "kafka:9092"),
                value_deserializer=lambda x: json.loads(x.decode("utf-8")),
                auto_offset_reset="latest",  # Start consuming from the newest messages
                group_id=random_group_id,
            )
            logging.info(
                f"✅ Processed data WebSocket bridge connected to '{PROCESSED_DATA_TOPIC}' with group_id: {random_group_id}"
            )
        except NoBrokersAvailable:
            logging.warning(
                "Processed data bridge could not connect to Kafka. Retrying in 5 seconds..."
            )
            eventlet.sleep(5)

    for message in consumer:
        try:
            processed_data = message.value
            # Use logging.debug to reduce verbosity, as this will be frequent
            logging.debug(
                f"Received processed data (Time={processed_data.get('Time')}). Emitting to frontend..."
            )
            # The 'new_data' event will now be sourced from processed data
            socketio.emit("new_data", processed_data)
        except Exception as e:
            logging.error(f"Error processing processed data message: {e}")


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

    for message in consumer:
        try:
            alert_data = message.value
            logging.info(f"Received alert: {alert_data}. Emitting to frontend...")
            socketio.emit("new_alert", alert_data)
        except Exception as e:
            logging.error(f"Error processing alert message: {e}")


def rto_suggestion_listener():
    """Listens to the RTO suggestions topic and pushes them to clients."""
    consumer = None
    logging.info("Starting Kafka listener for RTO suggestions...")
    while not consumer:
        try:
            random_group_id = f"backend-rto-{uuid.uuid4()}"
            consumer = KafkaConsumer(
                config.KAFKA_RTO_SUGGESTIONS_TOPIC,
                bootstrap_servers=os.getenv("KAFKA_BROKER_URL", "kafka:9092"),
                value_deserializer=lambda x: json.loads(x.decode("utf-8")),
                auto_offset_reset="latest",
                group_id=random_group_id,
            )
            logging.info("✅ WebSocket bridge connected to RTO suggestions topic.")
        except NoBrokersAvailable:
            logging.warning("RTO bridge could not connect to Kafka. Retrying...")
            eventlet.sleep(5)

    for message in consumer:
        try:
            suggestion_data = message.value
            logging.info(
                f"Received RTO suggestion: {suggestion_data}. Emitting to frontend..."
            )
            # The event name 'new_rto_suggestion' is important for the frontend
            socketio.emit("new_rto_suggestion", suggestion_data)
        except Exception as e:
            logging.error(f"Error processing RTO suggestion message: {e}")


def create_app():
    app = Flask(__name__)
    CORS(app)
    load_dotenv()
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    # Configuration loading
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
    
    # Redis Config
    app.config["REDIS_CONFIG"] = {
        "host": os.getenv("REDIS_HOST", "redis"),
        "port": int(os.getenv("REDIS_PORT", 6379)),
        "db": int(os.getenv("REDIS_DB", 0)),
    }
    app.config["MYSQL_POOL_SIZE"] = int(os.getenv("MYSQL_POOL_SIZE", 10))

    # Initialize Managers with app config
    # db_manager.initialize(app.config) 
    # cache_manager.initialize(app.config["REDIS_CONFIG"])

    # --- FIX: Safe RUL PREDICTOR Initialization ---
    logging.info("Pre-loading machine learning models...")

    # FIX: Remove complex RUL loading logic to prevent conflict with Connection Pool.
    # The /predict/rul endpoint only reads pre-calculated data from the DB and doesn't need a live Predictor object.
    app.config["RUL_PREDICTOR"] = None 
    
    logging.info("✅ All application configuration finalized. Complex ML initialization skipped to ensure API stability.")
    # --- END FIX ---

    # Register Blueprints
    # Import blueprints inside the function to ensure they use the correct config
    from .routes.data_routes import data_bp
    from .routes.prediction_routes import prediction_bp
    from .routes.overview_routes import overview_bp
    from .routes.pdm_routes import pdm_bp
    from .routes.rto_routes import rto_bp
    from .routes.mlops_routes import mlops_bp
    from .routes.control_routes import control_bp
    from .routes.analysis_routes import analysis_bp
    from .routes.health_routes import health_bp

    app.register_blueprint(data_bp, url_prefix="/api/data")
    app.register_blueprint(prediction_bp, url_prefix="/api/predict")
    app.register_blueprint(overview_bp, url_prefix="/api/status")
    app.register_blueprint(pdm_bp, url_prefix="/api/predict")
    app.register_blueprint(rto_bp, url_prefix="/api/rto")
    app.register_blueprint(mlops_bp, url_prefix="/api/models")
    app.register_blueprint(control_bp, url_prefix="/api/control")
    app.register_blueprint(analysis_bp, url_prefix="/api/analysis")
    # Register health_bp at the base /api prefix to make the route '/api/health'
    app.register_blueprint(health_bp, url_prefix="/api")

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
# Replace kafka_raw_data_listener with the new processed data listener
eventlet.spawn(kafka_processed_data_listener)
eventlet.spawn(rto_suggestion_listener)

# Gunicorn uses the 'app' object, so the __main__ block is for direct execution
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    logging.info(f"Starting direct execution SocketIO server on port {port}...")
    socketio.run(app, host="0.0.0.0", port=port)