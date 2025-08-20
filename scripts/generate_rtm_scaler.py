# scripts/generate_rtm_scaler.py

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import os
import logging

# --- Setup Logging and Configuration ---
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("RTM_Scaler_Generator")

CSV_FILE_PATH = "datasets/MASTER_DATASET.csv"
OUTPUT_DIR = "artifacts"  # We'll save scaler artifacts here

# IMPORTANT: These features MUST match the 'self.features' list in rtm_module.py
FEATURE_COLUMNS = [
    "Pressure_In",
    "Temperature_In",
    "Flow_Rate",
    "Pressure_Out",
    "Temperature_Out",
    "Efficiency",
    "Power_Consumption",
    "Vibration",
    "Ambient_Temperature",
    "Humidity",
    "Air_Pollution",
    "Frequency",
    "Amplitude",
    "Phase_Angle",
    "Velocity",
    "Stiffness",
]


def generate_and_save_scaler():
    logger.info("--- Starting RTM Scaler Generation ---")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    try:
        logger.info(f"Reading dataset from '{CSV_FILE_PATH}'...")
        df = pd.read_csv(CSV_FILE_PATH)
        df_features = df[FEATURE_COLUMNS].dropna()

        logger.info("Fitting StandardScaler on the data...")
        scaler = StandardScaler()
        scaler.fit(df_features)
        logger.info("Scaler fitted successfully.")

        # Define output paths
        mean_path = os.path.join(OUTPUT_DIR, "rtm_scaler_mean.npy")
        scale_path = os.path.join(OUTPUT_DIR, "rtm_scaler_scale.npy")

        # Save the mean and scale parameters
        np.save(mean_path, scaler.mean_)
        np.save(scale_path, scaler.scale_)

        logger.info("\n✅ RTM Scaler parameters saved successfully:")
        logger.info(f"  - Mean values saved to: {mean_path}")
        logger.info(f"  - Scale (std) values saved to: {scale_path}")

    except FileNotFoundError:
        logger.error(f"❌ ERROR: Dataset file not found at '{CSV_FILE_PATH}'.")
    except KeyError as e:
        logger.error(f"❌ ERROR: A required column was not found in the dataset: {e}")
    except Exception as e:
        logger.error(f"❌ An unexpected error occurred: {e}")


if __name__ == "__main__":
    generate_and_save_scaler()
