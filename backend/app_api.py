from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import eventlet
import random
from datetime import datetime

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app)  # Enable CORS
socketio = SocketIO(app, cors_allowed_origins="*")

# --- Fake Sensor Generator (replace with real db call) ---
def generate_fake_sensor():
    return {
        "id": random.randint(1, 999),
        "timestamp": datetime.now().isoformat(),
        "pressure_in": round(random.uniform(20, 100), 2),
        "temperature_in": round(random.uniform(40, 100), 2),
        "flow_rate": round(random.uniform(5, 25), 2),
        "pressure_out": round(random.uniform(30, 120), 2),
        "temperature_out": round(random.uniform(50, 110), 2),
        "efficiency": round(random.uniform(0.7, 1.0), 2),
        "power_consumption": round(random.uniform(100, 500), 2),
        "vibration": round(random.uniform(0.2, 2.0), 2),
        "status": "ON",
        "frequency": 50,
        "amplitude": 1.2,
        "phase_angle": 0.6,
        "mass": 80,
        "stiffness": 30,
        "damping": 10,
        "density": 1.2,
        "velocity": 3.4,
        "viscosity": 0.5,
    }

# --- Background Thread ---
def background_data_stream():
    while True:
        socketio.sleep(3)
        sensor_data = generate_fake_sensor()
        print("Sending sensor data:", sensor_data) 
        socketio.emit("sensor_data", sensor_data)
# --- Flask route (optional HTTP) ---
@app.route("/sensor-data/latest")
def get_latest():
    return jsonify(generate_fake_sensor())

# --- WebSocket Events ---
@socketio.on("connect")
def handle_connect():
    print("Client connected")
    emit("connected", {"message": "Connected to WebSocket!"})

# --- Start background job ---
@socketio.on("start_stream")
def start_stream():
    print("Starting data stream...")
    socketio.start_background_task(background_data_stream)


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
