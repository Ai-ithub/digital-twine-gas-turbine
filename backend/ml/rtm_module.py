# backend/ml/rtm_module.py (Final version with 20 features)

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
        
        # --- THIS IS THE FIX: The feature list now includes all 20 features ---
        self.features = [
            "Pressure_In", "Temperature_In", "Flow_Rate", "Pressure_Out", "Temperature_Out", 
            "Efficiency", "Power_Consumption", "Vibration", "Ambient_Temperature", "Humidity", 
            "Air_Pollution", "Frequency", "Amplitude", "Phase_Angle", "Velocity", "Stiffness",
            'Vibration_roll_mean', 'Power_Consumption_roll_mean', 'Vibration_roll_std', 
            'Power_Consumption_roll_std'
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
        try:
            self.scaler_mean = np.load(mean_path)
            self.scaler_scale = np.load(scale_path)
            logging.info("✅ RTM scaler parameters loaded successfully.")
        except FileNotFoundError:
            logging.error(f"❌ Scaler parameter files not found at {mean_path} or {scale_path}.")

    def predict(self, data_row: dict):
        if not self.session or self.scaler_mean is None:
            logging.error("❌ Model or scaler not loaded. Cannot predict.")
            return None

        try:
            # Create a DataFrame from the single row of data
            df_point = pd.DataFrame([data_row])
            
            # Select the features in the correct order
            input_data = df_point[self.features].values
            
            # Apply normalization
            input_scaled = (input_data - self.scaler_mean) / self.scaler_scale
            
            # Convert data type to float32 for the ONNX model
            input_tensor = input_scaled.astype(np.float32)
            
            input_name = self.session.get_inputs()[0].name
            prediction = self.session.run(None, {input_name: input_tensor})[0][0]
            
            return int(prediction)

        except KeyError as e:
            logging.error(f"❌ Prediction Error: Feature {e} is missing from the data row.")
            return None
        except Exception as e:
            logging.error(f"❌ Prediction Error: {e}")
            return None