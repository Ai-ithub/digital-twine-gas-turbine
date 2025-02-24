# import numpy as np
# import onnxruntime as ort
# from database import CompressorDatabase
# from typing import Dict, Optional
# import logging

# class VibrationPredictor:
#     """کلاس پیش‌بینی ارتعاشات با استفاده از مدل ONNX"""
    
#     def __init__(self,
#                  db_config: Dict = None,
#                  model_path: str = "farid_kaki_vibration_transformer.onnx",
#                  window_size: int = 60):
        
#         # تنظیمات پیش‌فرض
#         default_db_config = {
#             "host": "localhost",
#             "user": "root",
#             "password": "f1309D1309",
#             "database": "compressor",
#             "table": "CompressorData"
#         }
        
#         self.db = CompressorDatabase(**(db_config or default_db_config))
#         self.window_size = window_size
#         self.data_window = []
        
#         # لاگ‌گیری
#         logging.basicConfig(level=logging.INFO)
#         self.logger = logging.getLogger("VibrationPredictor")

#         # بارگیری مدل
#         try:
#             self.model = ort.InferenceSession(model_path)
#             self.logger.info(f"مدل {model_path} با موفقیت بارگیری شد")
#         except Exception as e:
#             self.logger.error(f"خطا در بارگیری مدل: {str(e)}")
#             raise

#         # بارگیری پارامترهای نرمال‌سازی
#         try:
#             self.scaler_mean = np.load('scaler_mean.npy')
#             self.scaler_scale = np.load('scaler_scale.npy')
#             self.logger.info("پارامترهای نرمال‌سازی بارگیری شدند")
#         except FileNotFoundError as e:
#             self.logger.error(f"فایل‌های نرمال‌سازی یافت نشدند: {str(e)}")
#             raise

#     def initialize(self) -> bool:
#         """آماده‌سازی اولیه سیستم"""
#         if not self.db.connect():
#             return False
#         if not self.db.load_data():
#             return False
#         self._fill_initial_window()
#         return True

#     def _fill_initial_window(self) -> None:
#         """پر کردن پنجره زمانی با داده‌های تاریخی"""
#         while len(self.data_window) < self.window_size:
#             record = self.db.get_next_record()
#             if not record:
#                 break
#             self._process_record(record)
        
#         if len(self.data_window) < self.window_size:
#             self.logger.warning(
#                 f"داده تاریخی ناکافی. نیاز: {self.window_size} - موجود: {len(self.data_window)}"
#             )

#     def _process_record(self, record: Dict) -> None:
#         """پردازش و نرمال‌سازی رکورد"""
#         try:
#             features = np.array([
#                 record['Pressure_In'],
#                 record['Temperature_In'],
#                 record['Flow_Rate'],
#                 record['Pressure_Out'],
#                 record['Temperature_Out'],
#                 record['Efficiency']
#             ], dtype=np.float32)
            
#             normalized = (features - self.scaler_mean) / self.scaler_scale
#             self.data_window.append(normalized)
#         except KeyError as e:
#             self.logger.error(f"فیلد ضروری {str(e)} در رکورد وجود ندارد")

#     def predict_next(self) -> Optional[Dict]:
#         """انجام پیش‌بینی برای رکورد بعدی"""
#         record = self.db.get_next_record()
#         if not record:
#             self.logger.info("هیچ داده جدیدی برای پیش‌بینی وجود ندارد")
#             return None

#         self._process_record(record)
        
#         if len(self.data_window) < self.window_size:
#             return {
#                 "status": "insufficient_data",
#                 "required": self.window_size,
#                 "available": len(self.data_window)
#             }

#         input_data = np.array(
#             self.data_window[-self.window_size:], 
#             dtype=np.float32
#         ).reshape(1, self.window_size, -1)

#         prediction = self.model.run(
#             None, 
#             {self.model.get_inputs()[0].name: input_data}
#         )[0][0][0]

#         # تبدیل به مقیاس واقعی
#         final_prediction = prediction * self.scaler_scale[-1] + self.scaler_mean[-1]

#         return {
#             "TimeData": record['TimeData'],
#             "vibration": float(final_prediction),
#             "input_features": {
#                 k: v for k, v in record.items() 
#                 if k != 'TimeData'
#             }
#         }
    


# # نمونه‌سازی و اجرا
# if __name__ == "__main__":
#     # پیکربندی دیتابیس
#     db_config = {
#         "host": "localhost",
#         "password": "f1309D1309",
#         "table": "CompressorData"
#     }
    
#     # ایجاد پیشبین
#     predictor = VibrationPredictor(db_config=db_config)
    
#     # مقداردهی اولیه
#     if not predictor.initialize():
#         print("خطا در آماده‌سازی سیستم!")
#         exit(1)
    
#     # انجام پیش‌بینی
#     for _ in range(10):
#         result = predictor.predict_next()
#         if result:
#             print(f"زمان: {result['TimeData']} | پیش‌بینی ارتعاش: {result['vibration']:.2f}")
#         else:
#             print("پیش‌بینی انجام نشد")
    
#     # بستن اتصال
#     predictor.db.close()



import numpy as np
import onnxruntime as ort
from database import CompressorDatabase
from typing import Dict, List, Optional
import logging

class VibrationPredictor:
    """کلاس پیش‌بینی ارتعاشات با استفاده از مدل ONNX"""
    
    def __init__(self,
                 db_config: Dict = None,
                 model_path: str = "farid_kaki_vibration_transformer.onnx",
                 window_size: int = 60):
        
        # تنظیمات پیش‌فرض
        default_db_config = {
            "host": "localhost",
            "user": "root",
            "password": "f1309D1309",
            "database": "compressor",
            "table": "CompressorData"
        }
        
        self.db = CompressorDatabase(**(db_config or default_db_config))
        self.window_size = window_size
        self.data_window = []
        
        # لاگ‌گیری
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("VibrationPredictor")

        # بارگیری مدل
        try:
            self.model = ort.InferenceSession(model_path)
            self.logger.info(f"مدل {model_path} با موفقیت بارگیری شد")
        except Exception as e:
            self.logger.error(f"خطا در بارگیری مدل: {str(e)}")
            raise

        # بارگیری پارامترهای نرمال‌سازی
        try:
            self.scaler_mean = np.load('scaler_mean.npy')
            self.scaler_scale = np.load('scaler_scale.npy')
            self.logger.info("پارامترهای نرمال‌سازی بارگیری شدند")
        except FileNotFoundError as e:
            self.logger.error(f"فایل‌های نرمال‌سازی یافت نشدند: {str(e)}")
            raise

    def initialize(self) -> bool:
        """آماده‌سازی اولیه سیستم"""
        if not self.db.connect():
            return False
        if not self.db.load_data():
            return False
        self._fill_initial_window()
        return True

    def _fill_initial_window(self) -> None:
        """پر کردن پنجره زمانی با داده‌های تاریخی"""
        while len(self.data_window) < self.window_size:
            record = self.db.get_next_record()
            if not record:
                break
            self._process_record(record)
        
        if len(self.data_window) < self.window_size:
            self.logger.warning(
                f"داده تاریخی ناکافی. نیاز: {self.window_size} - موجود: {len(self.data_window)}"
            )

    def _process_record(self, record: Dict) -> None:
        """پردازش و نرمال‌سازی رکورد"""
        try:
            features = np.array([
                record['Pressure_In'],
                record['Temperature_In'],
                record['Flow_Rate'],
                record['Pressure_Out'],
                record['Temperature_Out'],
                record['Efficiency']
            ], dtype=np.float32)
            
            normalized = (features - self.scaler_mean) / self.scaler_scale
            self.data_window.append(normalized)
        except KeyError as e:
            self.logger.error(f"فیلد ضروری {str(e)} در رکورد وجود ندارد")

    def predict_all(self) -> List[Dict]:
        """انجام پیش‌بینی برای تمام رکوردهای موجود"""
        predictions = []

        while True:
            record = self.db.get_next_record()
            if not record:
                break

            self._process_record(record)

            if len(self.data_window) >= self.window_size:
                input_data = np.array(
                    self.data_window[-self.window_size:], 
                    dtype=np.float32
                ).reshape(1, self.window_size, -1)

                prediction = self.model.run(
                    None, 
                    {self.model.get_inputs()[0].name: input_data}
                )[0][0][0]

                # تبدیل به مقیاس واقعی
                final_prediction = prediction * self.scaler_scale[-1] + self.scaler_mean[-1]

                predictions.append({
                    "TimeData": record['TimeData'],
                    "vibration": float(final_prediction),
                    "input_features": {
                        k: v for k, v in record.items() if k != 'TimeData'
                    }
                })
        
        return predictions


# نمونه‌سازی و اجرا
if __name__ == "__main__":
    # پیکربندی دیتابیس
    db_config = {
        "host": "localhost",
        "password": "f1309D1309",
        "table": "CompressorData"
    }
    
    # ایجاد پیشبین
    predictor = VibrationPredictor(db_config=db_config)
    
    # مقداردهی اولیه
    if not predictor.initialize():
        print("خطا در آماده‌سازی سیستم!")
        exit(1)
    
    # انجام پیش‌بینی برای همه داده‌ها
    results = predictor.predict_all()
    
    for res in results:
        print(f"زمان: {res['TimeData']} | پیش‌بینی ارتعاش: {res['vibration']:.2f}")

    # بستن اتصال
    predictor.db.close()
