# backend/ml/rtm_module.py

import numpy as np
import pandas as pd
import logging
from .base_predictor import BasePredictor
from backend.core import config


class AnomalyDetector(BasePredictor):
    def __init__(
        self,
        model_path=config.RTM_MODEL_PATH,
        mean_path=config.RTM_SCALER_MEAN_PATH,
        scale_path=config.RTM_SCALER_SCALE_PATH,
    ):
        super().__init__(model_path)
        self.features = config.RTM_FEATURE_COLUMNS
        self.scaler_mean = None
        self.scaler_scale = None
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
        status = super().get_status()  # Gets the model state from the base class.
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
