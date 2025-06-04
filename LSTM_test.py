import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.losses import MeanAbsoluteError
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

# 1. آماده‌سازی داده‌ها
df = pd.read_csv("balanced_compressor_time_series_with_anomalies.csv",
                 parse_dates=["Timestamp"])
df = df.dropna().sort_values("Timestamp")

N = len(df)
df['RUL'] = np.arange(N-1, -1, -1)

# لیست ستون‌های سنسور و RUL
numeric_cols = df.select_dtypes(include="number").columns.tolist()
features = [c for c in numeric_cols if c not in ["ID", "RUL"]]
# نرمال‌سازی
scaler = MinMaxScaler()
df[features] = scaler.fit_transform(df[features])

# 1.4 تولید دنباله‌های زمانی
def create_sequences(sensors, rul, seq_len=50):
    X, y = [], []
    for i in range(len(sensors) - seq_len):
        X.append(sensors[i : i + seq_len])
        y.append(rul[i + seq_len])
    return np.array(X), np.array(y)

seq_len = 50
sensors_array = df[features].values
rul_array     = df["RUL"].values

X, y = create_sequences(sensors_array, rul_array, seq_len)

# 1.5 تقسیم‌بندی به آموزش/آزمون
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, shuffle=True
)

# 2. طراحی مدل LSTM
model = Sequential([
    LSTM(64, input_shape=(seq_len, len(features))),
    Dense(1, activation="linear")
])
model.compile(optimizer=Adam(0.001), loss=MeanAbsoluteError(), metrics=[MeanAbsoluteError()])
model.summary()

# 3. آموزش مدل
early_stop = EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True)
history = model.fit(
    X_train, y_train,
    validation_split=0.2,
    epochs=100,
    batch_size=128,
    callbacks=[early_stop],
    verbose=2
)

# ارزیابی
mae_test = model.evaluate(X_test, y_test, verbose=0)[0]
print(f"Test MAE: {mae_test:.4f}")

# رسم روند آموزش
plt.plot(history.history["loss"], label="train loss")
plt.plot(history.history["val_loss"], label="val loss")
plt.xlabel("Epoch")
plt.ylabel("MAE")
plt.legend()
plt.show()
