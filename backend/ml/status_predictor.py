import pymysql
import numpy as np
import onnxruntime as ort
from sklearn.preprocessing import StandardScaler
import pandas as pd


class CompressorStatusPredictor:
    def __init__(self, db_config, model_path):
        self.db_config = db_config
        self.model_path = model_path
        self.ort_session = ort.InferenceSession(model_path)
        self.features = [
            "vibration",
            "power_consumption",
            "efficiency",
            "ambient_temperature",
            "humidity",
            "air_pollution",
            "maintenance_quality",
            "fuel_quality",
            "load_factor",
        ]
        self.scaler = StandardScaler()
        self._fit_scaler()
        self.status_map = {
            0: "Normal",
            1: "Load Surge",
            2: "Temperature Overload",
            3: "Mechanical Imbalance",
            4: "Critical Fault",
        }

    def _fit_scaler(self):
        """Preparing standardization with raw data from the database."""
        conn = pymysql.connect(**self.db_config)
        query = f"SELECT {', '.join(self.features)} FROM compressor_data"
        df = pd.read_sql_query(query, conn)
        conn.close()
        self.scaler.fit(df.values)

    def fetch_latest_data(self):
        """Get the latest data from the database."""
        conn = pymysql.connect(**self.db_config)
        query = f"SELECT {', '.join(self.features)} FROM compressor_data ORDER BY timestamp DESC LIMIT 1"
        df = pd.read_sql_query(query, conn)
        conn.close()
        return df.values

    def predict(self):
        """Compressor condition prediction based on database data."""
        data = self.fetch_latest_data()
        if data is None or len(data) == 0:
            return "No data available for prediction"

        # Data normalization
        data_scaled = self.scaler.transform(data.astype(np.float32))

        # Making predictions with ONNX
        ort_inputs = {
            self.ort_session.get_inputs()[0].name: data_scaled.astype(np.float32)
        }
        ort_outs = self.ort_session.run(None, ort_inputs)

        # Finding the class with the highest probability
        predicted_class = np.argmax(ort_outs[0], axis=1)[0]
        return self.status_map[predicted_class]
