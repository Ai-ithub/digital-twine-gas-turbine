import numpy as np
import pandas as pd
import os

# پارامترهای ثابت
MW = 16.04  # kg/kmol
R = 8.314 / MW  # kJ/kg.K
gamma = 1.31
Cp = gamma * R / (gamma - 1)

# تنظیمات کلی
num_devices = 10
records_per_device = 15_552_000
chunk_size = 1_000_000
output_dir = "compressor_datasets"
os.makedirs(output_dir, exist_ok=True)

def generate_chunk(start_time, chunk_size, device_id):
    np.random.seed(start_time + device_id)

    time = np.arange(start_time, start_time + chunk_size)

    pressure_in = 3.5 + 0.2 * np.sin(0.05 * time) + np.random.normal(0, 0.05, chunk_size)
    temperature_in = 293 + 5 * np.cos(0.03 * time) + np.random.normal(0, 1, chunk_size)
    flow_rate = 12 + 0.5 * np.sin(0.04 * time) + np.random.normal(0, 0.1, chunk_size)
    efficiency = 0.82 + 0.02 * np.sin(0.02 * time) + np.random.normal(0, 0.005, chunk_size)
    vibration = 1.0 + 0.3 * np.sin(0.06 * time) + np.random.normal(0, 0.05, chunk_size)

    pressure_ratio = 5.0 + 0.2 * np.sin(0.05 * time) + np.random.normal(0, 0.05, chunk_size)
    pressure_out = pressure_in * pressure_ratio
    temperature_out = temperature_in * (pressure_ratio ** ((gamma - 1) / (gamma * efficiency)))
    power_consumption = flow_rate * Cp * (temperature_out - temperature_in) / efficiency

    # وضعیت
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

    # سایر پارامترها
    frequency = 50 + 10 * np.sin(0.03 * time) + np.random.normal(0, 2, chunk_size)
    amplitude = 0.5 + 0.2 * np.sin(0.04 * time) + np.random.normal(0, 0.05, chunk_size)
    phase_angle = 180 + 30 * np.sin(0.02 * time) + np.random.normal(0, 5, chunk_size)
    mass = 75 + 5 * np.sin(0.01 * time) + np.random.normal(0, 1, chunk_size)
    stiffness = 5e5 + 1e4 * np.sin(0.01 * time) + np.random.normal(0, 5e3, chunk_size)
    damping = 500 + 50 * np.sin(0.01 * time) + np.random.normal(0, 10, chunk_size)
    density = 0.7 + 0.05 * np.sin(0.02 * time) + np.random.normal(0, 0.01, chunk_size)
    velocity = 30 + 5 * np.sin(0.03 * time) + np.random.normal(0, 1, chunk_size)
    viscosity = 1e-5 + 1e-6 * np.sin(0.02 * time) + np.random.normal(0, 1e-8, chunk_size)

    df = pd.DataFrame({
        "Time": time,
        "Device_ID": f"SGT-400-{device_id:02d}",
        "Pressure_In": pressure_in,
        "Temperature_In": temperature_in - 273.15,
        "Flow_Rate": flow_rate,
        "Pressure_Out": pressure_out,
        "Temperature_Out": temperature_out - 273.15,
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
    })

    # نویز به 5٪
    num_noisy = int(0.05 * chunk_size)
    noisy_indices = np.random.choice(df.index, size=num_noisy, replace=False)
    noise_std = {
        'Pressure_In': 0.2,
        'Temperature_In': 1.0,
        'Flow_Rate': 0.2,
        'Vibration': 0.1,
        'Efficiency': 0.01
    }
    for col, std in noise_std.items():
        df.loc[noisy_indices, col] += np.random.normal(0, std, size=num_noisy)

    # گمشدگی به 3٪
    num_missing = int(0.03 * chunk_size)
    missing_indices = np.random.choice(df.index, size=num_missing, replace=False)
    for col in ['Power_Consumption', 'Temperature_Out', 'Efficiency', 'Vibration']:
        df.loc[missing_indices, col] = np.nan

    return df

# تولید برای هر دستگاه
for device_id in range(1, num_devices + 1):
    print(f"\n📦 در حال تولید داده برای دستگاه SGT-400-{device_id:02d}...")
    num_chunks = records_per_device // chunk_size

    for chunk_index in range(num_chunks):
        start_time = chunk_index * chunk_size
        df_chunk = generate_chunk(start_time, chunk_size, device_id)

        filename = f"{output_dir}/SGT-400-{device_id:02d}_chunk_{chunk_index+1:02d}.csv"
        df_chunk.to_csv(filename, index=False)
        print(f"✅ چانک {chunk_index+1}/{num_chunks} برای دستگاه SGT-400-{device_id:02d} ذخیره شد.")
