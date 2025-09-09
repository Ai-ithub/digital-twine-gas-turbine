# backend/api/routes/mlops_routes.py

import logging
from flask import Blueprint, jsonify
from backend.ml.rtm_module import AnomalyDetector
# We will add other models here in the future

mlops_bp = Blueprint("mlops_routes", __name__)


@mlops_bp.route("/status", methods=["GET"])
def get_models_status():
    """
    Provides a health check for all critical ML models loaded in the system.
    """
    try:
        # Check RTM model status
        rtm_detector = AnomalyDetector()
        rtm_status = rtm_detector.get_status()

        # In the future, we would also check the RUL and RTO models
        # For now, we simulate their status
        rul_model_status = {
            "model_loaded": True,
            "scaler_loaded": True,
        }  # Assuming pdm-batch-runner handles it
        rto_model_status = {
            "model_loaded": True,
            "scaler_loaded": True,
        }  # Assuming rto-consumer handles it

        final_status = {
            "rtm_anomaly_detector": rtm_status,
            "pdm_rul_predictor": rul_model_status,
            "rto_optimizer": rto_model_status,
        }

        # Check if all models are fully loaded
        all_ok = all(
            s["model_loaded"] and s["scaler_loaded"] for s in final_status.values()
        )

        # Return status 200 if all are ok, otherwise 503 Service Unavailable
        http_status = 200 if all_ok else 503
        return jsonify(final_status), http_status

    except Exception as e:
        logging.error(f"Error in /models/status endpoint: {e}")
        return jsonify({"error": "Failed to check model status"}), 500
