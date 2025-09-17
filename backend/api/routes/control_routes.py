# backend/api/routes/control_routes.py

import logging
from flask import Blueprint, jsonify, request

control_bp = Blueprint("control_routes", __name__)

# A simple in-memory dictionary to store the control state for the demo
control_state = {
    "controlMode": "auto",
    "systemState": "running",
    "parameters": {
        "targetPressure": 85,
        "targetTemperature": 75,
        "flowRate": 450,
        "speed": 3600,
    }
}

@control_bp.route("/status", methods=['GET'])
def get_control_status():
    """Returns the current control status."""
    return jsonify(control_state)

@control_bp.route("/settings", methods=['POST'])
def update_control_settings():
    """Updates control settings (e.g., mode or parameters)."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    # Update state based on received data
    for key, value in data.items():
        if key in control_state:
            if isinstance(control_state[key], dict):
                control_state[key].update(value)
            else:
                control_state[key] = value

    logging.info(f"Control state updated: {control_state}")
    return jsonify({"message": "Settings updated successfully", "newState": control_state})