import random
import pandas as pd
import numpy as np

df = pd.read_csv("balanced_compressor_time_series_data.csv")
# تعداد هر نوع آنومالی
n_each = 100
N = len(df)

# تابع‌های تزریق آنومالی
def inject_spike(series, idx, magnitude=5.0):
    series[idx] += magnitude * np.sign(np.random.randn())

def inject_drift(series, start, length=150, slope=0.02):
    series[start:start+length] += slope * np.arange(length)

def inject_flatline(series, start, length=80):
    series[start:start+length] = series[start]

# ۱) تزریق ۱۰۰ Spike در Pressure_In
for _ in range(n_each):
    idx = random.randint(0, N-1)
    inject_spike(df['Pressure_In'].values, idx, magnitude=2.0)

# ۲) تزریق ۱۰۰ Drift در Temperature_In
for _ in range(n_each):
    start = random.randint(0, N-150)
    inject_drift(df['Temperature_In'].values, start, length=150, slope=0.02)

# ۳) تزریق ۱۰۰ Flatline در Flow_Rate
for _ in range(n_each):
    start = random.randint(0, N-80)
    inject_flatline(df['Flow_Rate'].values, start, length=80)

# (اختیاری) ذخیره مجدد CSV
df.to_csv("balanced_compressor_time_series_with_anomalies.csv", index=False)
print("تزریق آنومالی‌ها انجام شد و ذخیره شد.")
