import numpy as np
import onnxruntime as ort
from database import DatabaseReader

class VibrationPredictor:
    def __init__(self, db_config, model_path, window_size=60):
        # تنظیمات پایگاه داده
        self.db_reader = DatabaseReader(**db_config)
        
        # بارگیری مدل ONNX
        self.ort_session = ort.InferenceSession(model_path)
        
        # پارامترهای پیش‌پردازش
        self.window_size = window_size
        self.feature_columns = [
            'Pressure_In', 'Temperature_In', 'Flow_Rate',
            'Pressure_Out', 'Temperature_Out', 'Efficiency'
        ]
        
        # بارگیری پارامترهای Scaler
        self.scaler_mean = np.load('scaler_mean.npy')
        self.scaler_scale = np.load('scaler_scale.npy')
        
        # ذخیره‌سازی پنجره زمانی
        self.data_window = []

    def _preprocess(self, raw_data):
        """پیش‌پردازش داده‌های خام از پایگاه داده"""
        # استخراج ویژگی‌های مورد نیاز
        features = np.array([
            raw_data['Pressure_In'],
            raw_data['Temperature_In'],
            raw_data['Flow_Rate'],
            raw_data['Pressure_Out'],
            raw_data['Temperature_Out'],
            raw_data['Efficiency']
        ], dtype=np.float32)
        
        # نرمال‌سازی
        normalized = (features - self.scaler_mean) / self.scaler_scale
        return normalized

    def _create_input_tensor(self):
        """ایجاد تنسور ورودی برای مدل"""
        if len(self.data_window) < self.window_size:
            return None
            
        input_array = np.array(self.data_window[-self.window_size:], dtype=np.float32)
        return input_array.reshape(1, self.window_size, len(self.feature_columns))

    def predict_next(self):
        """پیش‌بینی برای رکورد بعدی"""
        # دریافت داده جدید
        raw_data = self.db_reader.get_next()
        if raw_data is None:
            return {"error": "No more data available"}
        
        # پیش‌پردازش و افزودن به پنجره
        processed = self._preprocess(raw_data)
        self.data_window.append(processed)
        
        # بررسی امکان پیش‌بینی
        model_input = self._create_input_tensor()
        if model_input is None:
            return {"status": "Insufficient data", "required": self.window_size, "current": len(self.data_window)}
        
        # انجام پیش‌بینی
        ort_inputs = {self.ort_session.get_inputs()[0].name: model_input}
        ort_outs = self.ort_session.run(None, ort_inputs)
        
        # معکوس‌سازی نرمال‌سازی
        prediction = ort_outs[0][0][0] * self.scaler_scale[-1] + self.scaler_mean[-1]
        
        return {
            "timestamp": raw_data['TimeData'],
            "vibration_prediction": float(prediction),
            "current_data": {k: v for k, v in raw_data.items() if k in self.feature_columns}
        }

    def run_predictions(self):
        """اجرای پیش‌بینی برای تمام داده‌ها"""
        results = []
        while True:
            prediction = self.predict_next()
            if 'error' in prediction:
                break
            results.append(prediction)
        return results
    


# تنظیمات اتصال به پایگاه داده
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "f1309D1309",
    "database": "compressor",
    "table": "CompressorData"
}

# ایجاد نمونه پیش‌بین
predictor = VibrationPredictor(
    db_config=db_config,
    model_path="farid_kaki_vibration_transformer.onnx",
    window_size=60
)

# اجرای پیش‌بینی‌ها
results = predictor.run_predictions()

# نمایش نتایج
for result in results[:3]:  # نمایش 3 نتیجه اول
    print(result)

#     print(f"""
# 📅 زمان: {result}
# 🔮 پیش‌بینی ویبریشن: {result['vibration_prediction']:.2f} mm/s
# 📊 داده‌های ورودی:
#     - فشار ورودی: {result['current_data']['Pressure_In']} bar
#     - دما ورودی: {result['current_data']['Temperature_In']} °C
#     - دبی جریان: {result['current_data']['Flow_Rate']} kg/s
#     """)


# (Due to technical issues, the search service is temporarily unavailable.)

# ### 🔍 تحلیل مشکل:
# این خطا نشان می‌دهد مدل برای پیش‌بینی نیاز به **۶۰ داده تاریخی** (یک ساعت گذشته) دارد، اما در حال حاضر تنها ۱ تا ۳ داده در اختیار دارد. این یک رفتار عادی است و نیاز به تنظیمات خاصی ندارد، اما باید دلیل آن را بدانید.

# ---

# ### 🛠️ راه‌حل‌های ممکن:

# #### ۱. **عدم وجود داده کافی در دیتابیس**
#    - **علت:** جدول `CompressorData` کمتر از ۶۰ رکورد دارد.
#    - **بررسی:**
#      ```python
#      # در خط اول کلاس DatabaseReader بعد از self._load_data() اضافه کنید
#      print(f"تعداد داده‌های بارگیری شده: {len(self.data)}")
#      ```
#    - **راه‌حل:** حداقل ۶۰ رکورد در دیتابیس وارد کنید.

# #### ۲. **پنجره زمانی (Window) پر نشده**
#    - **علت:** مدل باید ۶۰ داده متوالی را ببیند تا اولین پیش‌بینی را انجام دهد.
#    - **بررسی:** 
#      ```python
#      # بعد از خط self.data_window.append(processed)
#      print(f"اندازه پنجره فعلی: {len(self.data_window)}")
#      ```
#    - **راه‌حل:** 
#      - تا دریافت ۶۰ داده اولیه صبر کنید.
#      - یا از داده‌های گذشته برای پر کردن اولیه پنجره استفاده کنید.

# #### ۳. **پیکربندی نادرست مدل**
#    - **علت:** پارامتر `window_size` با معماری مدل مطابقت ندارد.
#    - **بررسی:**
#      ```python
#      # هنگام ایجاد VibrationPredictor
#      predictor = VibrationPredictor(..., window_size=60)  # مطمئن شوید 60 است
#      ```
#    - **راه‌حل:** پارامتر `window_size` را با مدل آموزش دیده تطبیق دهید.

# ---

# ### 💡 مثال کد اصلاحی (پر کردن اولیه پنجره):
# ```python
# class VibrationPredictor:
#     def __init__(self, ...):
#         # ... کدهای قبلی
        
#         # پر کردن اولیه پنجره با داده‌های موجود
#         while len(self.data_window) < self.window_size:
#             data = self.db_reader.get_next()
#             if data is None:
#                 break
#             self.data_window.append(self._preprocess(data))

#     def predict_next(self):
#         # ... بقیه کد بدون تغییر
# ```

# ---

# ### ✅ تست نهایی:
# ۱. **بررسی تعداد داده‌ها:**
#    ```python
#    # در خط اول DatabaseReader.__init__
#    print(f"تعداد رکوردهای دیتابیس: {len(self.data)}")
#    ```

# ۲. **اجرای پیش‌بینی پس از ۶۰ داده:**
#    ```python
#    # بعد از ۶۰ بار فراخوانی get_next()
#    for _ in range(60):
#        predictor.predict_next()
#    prediction = predictor.predict_next()
#    print(prediction)
#    ```

# ---

# ### 📌 نکته مهم:
# این رفتار **عمدی** است! مدل‌های سری‌زمانی برای پیش‌بینی نیاز به داده‌های تاریخی دارند. اگر می‌خواهید پیش‌بینی زودتر شروع شود، باید `window_size` را کاهش دهید (مثلاً به ۱۰).