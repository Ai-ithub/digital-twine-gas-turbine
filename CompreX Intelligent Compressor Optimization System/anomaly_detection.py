# anomaly_detection.py

import numpy as np
from sklearn.ensemble import IsolationForest
from sensor_sim import generate_sensor_data
import matplotlib.pyplot as plt


num_samples = 200
sensor_data = []


for _ in range(num_samples):
    pressure, temp, flow, vib = generate_sensor_data()
    sensor_data.append([pressure, temp, flow, vib])

sensor_data = np.array(sensor_data)


model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
model.fit(sensor_data)

# pish bini nahanjari
predictions = model.predict(sensor_data)
anomalies = np.where(predictions == -1)[0]

# kholase:
print(f" Number of data: {len(sensor_data)}")
print(f"Abnormalities identified: {anomalies}")

# rasme nemodar nahanjari
plt.figure(figsize=(10, 6))
plt.plot(sensor_data[:, 0], label='Pressure')
plt.scatter(anomalies, sensor_data[anomalies, 0], color='red', label='Anomaly', zorder=5)
plt.title("تشخیص ناهنجاری در فشار کمپرسور")
plt.xlabel("Time Step")
plt.ylabel("Pressure (bar)")
plt.legend()
plt.grid(True)
plt.show()
