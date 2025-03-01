import pymysql
import numpy as np
import onnxruntime as ort
import torch
from sklearn.preprocessing import StandardScaler
import pandas as pd

class CompressorStatusPredictor:
    def __init__(self, db_config, model_path):
        self.db_config = db_config
        self.model_path = model_path
        self.ort_session = ort.InferenceSession(model_path)
        self.features = ["Vibration", "Power_Consumption", "Efficiency", 
                         "Ambient_Temperature", "Humidity", "Air_Pollution", 
                         "Maintenance_Quality", "Fuel_Quality", "Load_Factor"]
        self.scaler = StandardScaler()
        self._fit_scaler()
        self.status_map = {
            0: "Normal",
            1: "Load Surge",
            2: "Temperature Overload",
            3: "Mechanical Imbalance",
            4: "Critical Fault"
        }
    
    def _fit_scaler(self):
        """آماده‌سازی استانداردسازی با داده‌های اولیه از دیتابیس."""
        conn = pymysql.connect(**self.db_config)
        query = f"SELECT {', '.join(self.features)} FROM compressor_data"
        df = pd.read_sql_query(query, conn)
        conn.close()
        self.scaler.fit(df.values)
    
    def fetch_latest_data(self):
        """دریافت جدیدترین داده‌ها از دیتابیس."""
        conn = pymysql.connect(**self.db_config)
        query = f"SELECT {', '.join(self.features)} FROM compressor_data ORDER BY timestamp DESC LIMIT 1"
        df = pd.read_sql_query(query, conn)
        conn.close()
        return df.values
    
    def predict(self):
        """پیش‌بینی وضعیت کمپرسور بر اساس داده‌های دیتابیس."""
        data = self.fetch_latest_data()
        if data is None or len(data) == 0:
            return "No data available for prediction"
        
        # نرمال‌سازی داده
        data_scaled = self.scaler.transform(data.astype(np.float32))
        
        # انجام پیش‌بینی با ONNX
        ort_inputs = {self.ort_session.get_inputs()[0].name: data_scaled.astype(np.float32)}
        ort_outs = self.ort_session.run(None, ort_inputs)
        
        # یافتن کلاس با بیشترین احتمال
        predicted_class = np.argmax(ort_outs[0], axis=1)[0]
        return self.status_map[predicted_class]
