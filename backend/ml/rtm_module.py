# backend/ml/rtm_module.py

import numpy as np
import pandas as pd
import logging
from .base_predictor import BasePredictor  # <-- ۱. کلاس پایه را وارد می‌کنیم


class AnomalyDetector(BasePredictor):  # <-- ۲. از کلاس پایه ارث‌بری می‌کنیم
    def __init__(
        self,
        model_path="artifacts/isolation_forest_model.onnx",
        mean_path="artifacts/rtm_scaler_mean.npy",
        scale_path="artifacts/rtm_scaler_scale.npy",
    ):
        # ۳. سازنده کلاس پایه را فراخوانی می‌کنیم تا مدل را لود کند
        super().__init__(model_path)

        self.scaler_mean = None
        self.scaler_scale = None
        # لیست ویژگی‌ها باید شامل تمام ۲۰ ویژگی باشد
        self.features = [
            "Pressure_In",
            "Temperature_In",
            "Flow_Rate",
            "Pressure_Out",
            "Temperature_Out",
            "Efficiency",
            "Power_Consumption",
            "Vibration",
            "Ambient_Temperature",
            "Humidity",
            "Air_Pollution",
            "Frequency",
            "Amplitude",
            "Phase_Angle",
            "Velocity",
            "Stiffness",
            "Vibration_roll_mean",
            "Power_Consumption_roll_mean",
            "Vibration_roll_std",
            "Power_Consumption_roll_std",
        ]
        self.load_scaler_params(mean_path, scale_path)

    def load_scaler_params(self, mean_path, scale_path):
        """Loads the pre-computed mean and scale vectors for normalization."""
        try:
            self.scaler_mean = np.load(mean_path)
            self.scaler_scale = np.load(scale_path)
            logging.info("✅ RTM scaler parameters loaded successfully.")
        except FileNotFoundError:
            logging.error(
                f"❌ Scaler parameter files not found at {mean_path} or {scale_path}."
            )

    def get_status(self):
        """Returns the loading status of the model AND scaler."""
        status = super().get_status()  # وضعیت مدل را از کلاس پایه می‌گیرد
        status["scaler_loaded"] = (
            self.scaler_mean is not None and self.scaler_scale is not None
        )
        return status

    def predict(self, data_row: dict):
        """Performs a prediction on a single row of data."""
        if not self.session or self.scaler_mean is None:
            logging.error("❌ Model or scaler not loaded. Cannot predict.")
            return None

        try:
            df_point = pd.DataFrame([data_row])
            input_data = df_point[self.features].values
            input_scaled = (input_data - self.scaler_mean) / self.scaler_scale
            input_tensor = input_scaled.astype(np.float32)

            input_name = self.session.get_inputs()[0].name
            prediction = self.session.run(None, {input_name: input_tensor})[0][0]

            return int(prediction)
        except KeyError as e:
            logging.error(
                f"❌ Prediction Error: Feature {e} is missing from the data row."
            )
            return None
        except Exception as e:
            logging.error(f"❌ Prediction Error: {e}")
            return None
