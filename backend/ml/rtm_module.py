# backend/ml/rtm_module.py (Final Corrected Version)

import onnxruntime as ort
import numpy as np
import pandas as pd
import logging
from sklearn.preprocessing import StandardScaler # <--- Import StandardScaler

class AnomalyDetector:
    def __init__(self, model_path="artifacts/isolation_forest_model.onnx"):
        self.model_path = model_path
        self.session = None
        self.scaler = StandardScaler() # <--- Initialize a new scaler
        self.is_scaler_fitted = False # <--- Add a flag to check if scaler is fitted
        self.features = [
            "Pressure_In", "Temperature_In", "Flow_Rate", "Pressure_Out",
            "Temperature_Out", "Efficiency", "Power_Consumption", "Vibration",
            "Ambient_Temperature", "Humidity", "Air_Pollution", "Frequency",
            "Amplitude", "Phase_Angle", "Velocity", "Stiffness",
        ]
        self.load_model()

    def load_model(self):
        try:
            self.session = ort.InferenceSession(self.model_path)
            logging.info(f"✅ Anomaly detection model loaded from {self.model_path}")
        except Exception as e:
            logging.error(f"❌ Error loading model: {e}")

    def predict(self, data_row: dict):
        if not self.session:
            logging.error("❌ Model not loaded. Cannot predict.")
            return None

        try:
            df_point = pd.DataFrame([data_row])
            input_data = df_point[self.features].values.astype(np.float32)

            # --- THIS IS THE CRITICAL FIX ---
            # If the scaler has not been fitted yet, fit it on the first data point.
            # In a real scenario, you would fit it on a larger initial dataset.
            if not self.is_scaler_fitted:
                self.scaler.fit(input_data)
                self.is_scaler_fitted = True
            
            # Now, transform the data using the fitted scaler
            input_scaled = self.scaler.transform(input_data)
            # --------------------------------

            input_name = self.session.get_inputs()[0].name
            prediction = self.session.run(None, {input_name: input_scaled})[0][0]

            return int(prediction)

        except KeyError:
            logging.error("❌ Prediction Error: One or more required features are missing.")
            return None
        except Exception as e:
            logging.error(f"❌ Prediction Error: {e}")
            return None