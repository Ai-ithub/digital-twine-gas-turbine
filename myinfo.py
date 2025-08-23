
# complete_pipeline.py

import pandas as pd
import numpy as np

from sklearn.impute import KNNImputer
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from scipy.signal import welch

from pykalman import KalmanFilter

import tensorflow as tf
from tensorflow.keras.layers import Input, Dense, LSTM
from tensorflow.keras.models import Model, Sequential
from tensorflow.keras.callbacks import EarlyStopping

import torch
from torch.utils.data import Dataset, DataLoader
from sklearn.metrics import mean_absolute_error

# 1. خواندن داده
df = pd.read_csv("MASTER_DATASET.csv", parse_dates=["Timestamp"])

# 2. پاک‌سازی اولیه
df.dropna(subset=["Label"], inplace=True)               # حذف سطرهای فاقد برچسب
df.reset_index(drop=True, inplace=True)

# 3. جایگزینی مقادیر گمشده با KNN Imputer
imputer = KNNImputer(n_neighbors=3)
df[df.columns] = imputer.fit_transform(df)

# 4. حذف نویز ویبره با فیلتر کالمن
kf = KalmanFilter(initial_state_mean=df["Vibration"].mean())
filtered_vib, _ = kf.filter(df["Vibration"].values)
df["Vibration"] = filtered_vib

# 5. مهندسی ویژگی‌های ویبره
# 5.1 RMS
df["vib_rms"] = np.sqrt(np.mean(df["Vibration"] ** 2))

# 5.2 فرکانس پیک (PSD)
freqs, psd = welch(df["Vibration"], fs=1000, nperseg=1024)
df["vib_peak_freq"] = freqs[np.argmax(psd)]

# 6. انتخاب ویژگی‌ها و برچسب
feature_cols = [
    'Pressure_In','Temperature_In','Flow_Rate','Pressure_Out','Temperature_Out',
    'Efficiency','Power_Consumption','Ambient_Temperature','Humidity',
    'Air_Pollution','Startup_Shutdown_Cycles','Maintenance_Quality',
    'Fuel_Quality','Load_Factor','Anomaly_IForest','Anomaly_LOF',
    'Anomaly_DBSCAN','Anomaly_Autoencoder','Anomaly_Score','Final_Anomaly',
    'Stiffness','Frequency','Damping','Mass','vib_std','vib_max',
    'Amplitude','Density','vib_mean','Velocity','Viscosity','Phase_Angle',
    'vib_min','vib_rms','vib_peak_freq'
]
label_col = "Label"

X = df[feature_cols].values
y = df[label_col].values

# 7. تقسیم داده و نرمال‌سازی
# 70% train, 15% val, 15% test (فقط shuffle=False چون توالی مهم است)
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.3, random_state=42, shuffle=False
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, random_state=42, shuffle=False
)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_val   = scaler.transform(X_val)
X_test  = scaler.transform(X_test)

# 8. تعریف کلاس SequenceDataset برای PyTorch
class SequenceDataset(Dataset):
    def __init__(self, X, y, seq_len=60):
        self.seq_len = seq_len
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.float32).unsqueeze(1)
        self.seqs, self.labels = self._create_sequences()

    def _create_sequences(self):
        seqs, labs = [], []
        for i in range(len(self.X) - self.seq_len):
            seqs.append(self.X[i : i + self.seq_len])
            labs.append(self.y[i + self.seq_len - 1])
        return torch.stack(seqs), torch.stack(labs)

    def __len__(self):
        return len(self.seqs)

    def __getitem__(self, idx):
        return self.seqs[idx], self.labels[idx]

seq_len    = 60
batch_size = 32

train_ds = SequenceDataset(X_train, y_train, seq_len)
val_ds   = SequenceDataset(X_val,   y_val,   seq_len)

train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
val_loader   = DataLoader(val_ds,   batch_size=batch_size)

# 9. مدل LSTM در TensorFlow برای پیش‌بینی RUL
tf_model = Sequential([
    LSTM(64, input_shape=(seq_len, len(feature_cols))),
    Dense(1, activation="linear")
])
tf_model.compile(loss="mae", optimizer="adam")

early_stop = EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True)

# بازشکل‌دهی ورودی برای TensorFlow
def reshape_for_tf(X, seq_len):
    n = len(X) - seq_len + 1
    return X.reshape(n, seq_len, X.shape[1])

Xtr_tf = reshape_for_tf(X_train, seq_len)
ytr_tf = y_train[seq_len-1:]
Xv_tf  = reshape_for_tf(X_val,   seq_len)
yv_tf  = y_val[seq_len-1:]

tf_model.fit(
    Xtr_tf, ytr_tf,
    validation_data=(Xv_tf, yv_tf),
    epochs=100, batch_size=batch_size,
    callbacks=[early_stop],
    verbose=2
)

# ارزیابی LSTM روی داده‌ی تست
Xte_tf = reshape_for_tf(X_test, seq_len)
yte_tf = y_test[seq_len-1:]
y_pred = tf_model.predict(Xte_tf)
mae = mean_absolute_error(yte_tf, y_pred)
print(f"LSTM Test MAE: {mae:.4f}")

# 10. مدل Autoencoder برای تشخیص ناهنجاری
# فقط در داده‌های با Label پایین (نمونه‌های سالم) آموزش می‌دهد
threshold = np.quantile(y_train, 0.8)
mask_normal = y_train < threshold
X_norm = X_train[mask_normal]

inp_dim      = X_norm.shape[1]
encoding_dim = 10

inp_layer   = Input(shape=(inp_dim,))
enc_layer   = Dense(encoding_dim, activation="relu")(inp_layer)
dec_layer   = Dense(inp_dim, activation="sigmoid")(enc_layer)
autoencoder = Model(inputs=inp_layer, outputs=dec_layer)
autoencoder.compile(optimizer="adam", loss="mse")

autoencoder.fit(
    X_norm, X_norm,
    epochs=50, batch_size=32,
    validation_split=0.1,
    callbacks=[early_stop],
    verbose=2
)

# 11. ارزیابی Autoencoder
reconstructions = autoencoder.predict(X_test)
mse_errors      = np.mean(np.square(reconstructions - X_test), axis=1)
# تعیین آستانه (مثلاً میانگین + 2*انحراف معیار)
thr = mse_errors.mean() + 2 * mse_errors.std()
anomalies = mse_errors > thr
print(f"Detected anomalies in test set: {anomalies.sum()} out of {len(anomalies)}")

# 12. خروجی مدل‌ها برای استفاده‌های بعدی
tf_model.save("lstm_rul_model.h5")
autoencoder.save("vib_autoencoder.h5")

print("Pipeline completed successfully!")