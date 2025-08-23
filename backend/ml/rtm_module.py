# backend/ml/rtm_module.py (Final version with correct data type casting)

import onnxruntime as ort
import numpy as np
import pandas as pd
import logging

class AnomalyDetector:
    def __init__(
        self,
        model_path="artifacts/isolation_forest_model.onnx",
        mean_path="artifacts/rtm_scaler_mean.npy",
        scale_path="artifacts/rtm_scaler_scale.npy"
    ):
        self.model_path = model_path
        self.session = None
        self.scaler_mean = None
        self.scaler_scale = None
        
        self.features = [
            "Pressure_In", "Temperature_In", "Flow_Rate", "Pressure_Out",
            "Temperature_Out", "Efficiency", "Power_Consumption", "Vibration",
            "Ambient_Temperature", "Humidity", "Air_Pollution", "Frequency",
            "Amplitude", "Phase_Angle", "Velocity", "Stiffness",
        ]

        self.load_model()
        self.load_scaler_params(mean_path, scale_path)

    def load_model(self):
        try:
            self.session = ort.InferenceSession(self.model_path)
            logging.info(f"✅ Anomaly detection model loaded from {self.model_path}")
        except Exception as e:
            logging.error(f"❌ Error loading model: {e}")

    def load_scaler_params(self, mean_path, scale_path):
        """Loads the pre-computed mean and scale vectors for normalization."""
        try:
            self.scaler_mean = np.load(mean_path)
            self.scaler_scale = np.load(scale_path)
            logging.info("✅ RTM scaler parameters loaded successfully.")
        except FileNotFoundError:
            logging.error(f"❌ Scaler parameter files not found at {mean_path} or {scale_path}.")
            logging.error("Please run 'scripts/generate_rtm_scaler.py' to create them.")

    def predict(self, data_row: dict):
        if not self.session or self.scaler_mean is None:
            logging.error("❌ Model or scaler not loaded. Cannot predict.")
            return None

        try:
            df_point = pd.DataFrame([data_row])
            input_data = df_point[self.features].values

            # Apply normalization
            input_scaled = (input_data - self.scaler_mean) / self.scaler_scale
            
            # --- THIS IS THE FIX: Convert the data type to float32 ---
            input_tensor = input_scaled.astype(np.float32)
            
            input_name = self.session.get_inputs()[0].name
            # Pass the correctly typed tensor to the model
            prediction = self.session.run(None, {input_name: input_tensor})[0][0]
            
            return int(prediction)

        except KeyError as e:
            logging.error(f"❌ Prediction Error: Feature {e} is missing from the data row.")
            return None
        except Exception as e:
            logging.error(f"❌ Prediction Error: {e}")
            return None