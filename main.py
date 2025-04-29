import numpy as np
import pandas as pd
import datetime

# تعریف تعداد نمونه‌ها
num_samples = 100000

# پارامترهای ثابت
np.random.seed(42)  # ثابت کردن Seed برای تولید قابل تکرار
MW = 16.04  # وزن مولکولی گاز (kg/kmol)
R = 8.314 / MW  # ثابت گاز جهانی برای گاز متان (kJ/kg·K)
gamma = 1.31  # نسبت گرمای مخصوص
Cp = gamma * R / (gamma - 1)  # گرمای مخصوص ثابت فشار (kJ/kg·K)

# تعریف بردار زمانی
time_interval = 1  # فاصله زمانی (ثانیه)
time = np.arange(0, num_samples * time_interval, time_interval)  # بردار زمانی

start_time = datetime.datetime(2025, 4, 28, 0, 0, 0)  # مثلا شروع از این تاریخ
timestamp = [start_time + datetime.timedelta(seconds=int(t)) for t in time] 
# تولید داده‌های سری زمانی
pressure_in = 3.5 + 0.2 * np.sin(0.05 * time) + np.random.normal(0, 0.05, num_samples)  # فشار ورودی (bara)
temperature_in = 293 + 5 * np.cos(0.03 * time) + np.random.normal(0, 1, num_samples)  # دمای ورودی (K)
flow_rate = 12 + 0.5 * np.sin(0.04 * time) + np.random.normal(0, 0.1, num_samples)  # جریان جرمی (kg/s)
efficiency = 0.82 + 0.02 * np.sin(0.02 * time) + np.random.normal(0, 0.005, num_samples)  # کارآیی چندگانه
vibration = 1.0 + 0.3 * np.sin(0.06 * time) + np.random.normal(0, 0.05, num_samples)  # ارتعاشات (mm/s)

# محاسبات مبتنی بر روابط فیزیکی
pressure_ratio = 5.0 + 0.2 * np.sin(0.05 * time) + np.random.normal(0, 0.05, num_samples)  # نسبت فشار
pressure_out = pressure_in * pressure_ratio  # فشار خروجی (bara)

# دمای خروجی
temperature_out = temperature_in * (pressure_ratio ** ((gamma - 1) / (gamma * efficiency)))

# توان مصرفی
power_consumption = flow_rate * Cp * (temperature_out - temperature_in) / efficiency  # kW

# ایجاد همبستگی بیشتر بین پارامترها و Status با توازن مناسب
# تنظیم آستانه‌ها برای دستیابی به ۶۵٪ Normal، ۲۰٪ Imbalance، ۱۵٪ Fault
normal_threshold = np.percentile(vibration, 65)
imbalance_threshold = np.percentile(vibration, 85)
power_threshold = np.percentile(power_consumption, 65)
fault_power_threshold = np.percentile(power_consumption, 85)

status = np.where(
    (vibration < normal_threshold) & (power_consumption < power_threshold) & (efficiency > 0.80),
    "Normal",
    np.where(
        ((vibration >= normal_threshold) & (vibration < imbalance_threshold)) |
        ((power_consumption >= power_threshold) & (power_consumption < fault_power_threshold)),
        "Imbalance",
        "Fault"
    )
)

# داده‌های مرتبط با ارتعاشات
frequency = 50 + 10 * np.sin(0.03 * time) + np.random.normal(0, 2, num_samples)  # فرکانس ارتعاشات (Hz)
amplitude = 0.5 + 0.2 * np.sin(0.04 * time) + np.random.normal(0, 0.05, num_samples)  # Amplitude ارتعاشات (mm)
phase_angle = 180 + 30 * np.sin(0.02 * time) + np.random.normal(0, 5, num_samples)  # زاویه فاز (Degrees)

# داده‌های مرتبط با معادله جرم-فنر
mass = 75 + 5 * np.sin(0.01 * time) + np.random.normal(0, 1, num_samples)  # جرم محور (kg)
stiffness = 5e5 + 1e4 * np.sin(0.01 * time) + np.random.normal(0, 5e3, num_samples)  # سختی فنر (N/m)
damping = 500 + 50 * np.sin(0.01 * time) + np.random.normal(0, 10, num_samples)  # ضریب میرایی (Ns/m)

# داده‌های مرتبط با معادله ناویر-استوکس
density = 0.7 + 0.05 * np.sin(0.02 * time) + np.random.normal(0, 0.01, num_samples)  # چگالی گاز (kg/m³)
velocity = 30 + 5 * np.sin(0.03 * time) + np.random.normal(0, 1, num_samples)  # سرعت جریان (m/s)
viscosity = 1e-5 + 1e-6 * np.sin(0.02 * time) + np.random.normal(0, 1e-8, num_samples)  # ضریب-viscosity (Pa·s)

# ایجاد DataFrame
data = {
    "ID": time,
    "Timestamp": timestamp,  # اضافه کردن بردار زمانی
    "Pressure_In": pressure_in,
    "Temperature_In": temperature_in - 273.15,  # تبدیل به °C
    "Flow_Rate": flow_rate,
    "Pressure_Out": pressure_out,
    "Temperature_Out": temperature_out - 273.15,  # تبدیل به °C
    "Efficiency": efficiency,
    "Power_Consumption": power_consumption,
    "Vibration": vibration,
    "Status": status,
    "Frequency": frequency,
    "Amplitude": amplitude,
    "Phase_Angle": phase_angle,
    "Mass": mass,
    "Stiffness": stiffness,
    "Damping": damping,
    "Density": density,
    "Velocity": velocity,
    "Viscosity": viscosity
}

df = pd.DataFrame(data)

# بررسی توزیع داده‌های Status
status_counts = df["Status"].value_counts(normalize=True) * 100
print("توزیع وضعیت‌ها در داده‌های تولید شده:")
print(status_counts)

# ذخیره داده‌ها در فایل CSV
df.to_csv("balanced_compressor_time_series_data.csv", index=False)

print("داده‌های متعادل شده با همبستگی قوی و توزیع مطلوب Status با موفقیت تولید و ذخیره شد.")
