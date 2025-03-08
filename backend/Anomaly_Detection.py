# import pymysql
# import numpy as np
# import onnxruntime as ort
# from sklearn.preprocessing import StandardScaler
# import pandas as pd

# class AnomalyDetector:
#     def __init__(self, db_config, model_path):
#         """
#         سازنده کلاس: اتصال به دیتابیس و بارگذاری مدل ONNX.
        
#         :param db_config: تنظیمات اتصال به دیتابیس MySQL
#         :param model_path: مسیر فایل مدل ONNX
#         """
#         self.db_config = db_config
#         self.model_path = model_path
#         self.ort_session = ort.InferenceSession(model_path)
#         self.features = [
#             "Pressure_In", "Temperature_In", "Flow_Rate", "Pressure_Out",
#             "Temperature_Out", "Efficiency", "Power_Consumption", "Vibration",
#             "Ambient_Temperature", "Humidity", "Air_Pollution",
#             "Startup_Shutdown_Cycles", "Maintenance_Quality", "Fuel_Quality",
#             "Load_Factor"
#         ]
#         self.scaler = StandardScaler()
#         self._fit_scaler()

#     def _fit_scaler(self):
#         """
#         آماده‌سازی استانداردسازی با داده‌های اولیه از دیتابیس.
#         """
#         conn = pymysql.connect(**self.db_config)
#         query = f"SELECT {', '.join(self.features)} FROM compressor_data"
#         df = pd.read_sql_query(query, conn)
#         conn.close()
#         self.scaler.fit(df.values)

#     def fetch_latest_data(self):
#         """
#         دریافت جدیدترین داده‌ها از دیتابیس.
        
#         :return: آخرین ردیف داده‌ها به صورت NumPy array
#         """
#         conn = pymysql.connect(**self.db_config)
#         query = f"SELECT {', '.join(self.features)} FROM compressor_data ORDER BY Time DESC LIMIT 1"
#         df = pd.read_sql_query(query, conn)
#         conn.close()
#         return df.values

#     def detect_anomalies(self, threshold=0.5):
#         """
#         شناسایی ناهنجاری‌ها بر اساس داده‌های جدید.
        
#         :param threshold: آستانه برای تشخیص ناهنجاری
#         :return: وضعیت ناهنجاری (Normal/Anomaly)
#         """
#         # دریافت داده‌های جدید
#         data = self.fetch_latest_data()
#         if data is None or len(data) == 0:
#             return "No data available for anomaly detection"

#         # نرمال‌سازی داده‌ها
#         data_scaled = self.scaler.transform(data.astype(np.float32))

#         # انجام پیش‌بینی با مدل ONNX
#         ort_inputs = {self.ort_session.get_inputs()[0].name: data_scaled.astype(np.float32)}
#         ort_outs = self.ort_session.run(None, ort_inputs)

#         # تعیین وضعیت ناهنجاری بر اساس آستانه
#         anomaly_score = ort_outs[0][0]
#         if anomaly_score > threshold:
#             return "Anomaly Detected"
#         else:
#             return "Normal Operation"






import pymysql
import numpy as np
import onnxruntime as ort
from sklearn.preprocessing import StandardScaler
import pandas as pd

class AnomalyDetector:
    def __init__(self, db_config, model_path):
        """
        سازنده کلاس: اتصال به دیتابیس و بارگذاری مدل ONNX.
        
        :param db_config: تنظیمات اتصال به دیتابیس MySQL
        :param model_path: مسیر فایل مدل ONNX
        """
        self.db_config = db_config
        self.model_path = model_path
        self.ort_session = ort.InferenceSession(model_path)
        self.features = [
            "Time",  # حفظ Time به عنوان یک ویژگی
            "Pressure_In", "Temperature_In", "Flow_Rate", "Pressure_Out",
            "Temperature_Out", "Efficiency", "Power_Consumption", "Vibration",
            "Ambient_Temperature", "Humidity", "Air_Pollution",
            "Startup_Shutdown_Cycles", "Maintenance_Quality", "Fuel_Quality",
            "Load_Factor"
        ]
        self.scaler = StandardScaler()
        self._fit_scaler()

    def _fit_scaler(self):
        """
        آماده‌سازی استانداردسازی با داده‌های اولیه از دیتابیس.
        """
        conn = pymysql.connect(**self.db_config)
        query = f"SELECT {', '.join(self.features)} FROM compressor_data"
        df = pd.read_sql_query(query, conn)
        conn.close()

        # استانداردسازی تمام ویژگی‌ها (شامل Time)
        self.scaler.fit(df.values)

    def fetch_latest_data(self):
        """
        دریافت جدیدترین داده‌ها از دیتابیس.
        
        :return: آخرین ردیف داده‌ها به صورت NumPy array
        """
        conn = pymysql.connect(**self.db_config)
        query = f"SELECT {', '.join(self.features)} FROM compressor_data ORDER BY Time DESC LIMIT 1"
        df = pd.read_sql_query(query, conn)
        conn.close()

        # بازگرداندن داده‌ها بدون حذف Time
        return df.values

    def detect_anomalies(self, threshold=0.5):
        """
        شناسایی ناهنجاری‌ها بر اساس داده‌های جدید.
        
        :param threshold: آستانه برای تشخیص ناهنجاری
        :return: وضعیت ناهنجاری (Normal/Anomaly)
        """
        # دریافت داده‌های جدید
        data = self.fetch_latest_data()
        if data is None or len(data) == 0:
            return "No data available for anomaly detection"

        # نرمال‌سازی داده‌ها (شامل Time)
        data_scaled = self.scaler.transform(data.astype(np.float32))

        # انجام پیش‌بینی با مدل ONNX
        ort_inputs = {self.ort_session.get_inputs()[0].name: data_scaled.astype(np.float32)}
        ort_outs = self.ort_session.run(None, ort_inputs)

        # تعیین وضعیت ناهنجاری بر اساس آستانه
        anomaly_score = ort_outs[0][0]
        if anomaly_score > threshold:
            return "Anomaly Detected"
        else:
            return "Normal Operation"