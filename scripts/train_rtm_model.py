# scripts/train_rtm_model.py

import os
import logging
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib
import skl2onnx
from skl2onnx.common.data_types import FloatTensorType
import mlflow
from mlflow.models import infer_signature
# Assuming 'backend.core' provides configuration details like MLFLOW_TRACKING_URI
# and RTM_FEATURE_COLUMNS. We will use a mock object for demonstration.


# --- Mock Configuration (Replace with actual import if available) ---
class MockConfig:
    MLFLOW_TRACKING_URI = "http://127.0.0.1:5000"  # Replace with your actual URI
    # Features defined in the original code, including engineered ones
    RTM_FEATURE_COLUMNS = [
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
        "Vibration_roll_mean",
        "Power_Consumption_roll_mean",
        "Vibration_roll_std",
        "Power_Consumption_roll_std",
    ]


config = MockConfig()
# --- End Mock Configuration ---


# --- 1. Setup Logging and Configuration ---
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# --- Configuration ---
CONFIG = {
    "data_path": "../datasets/MASTER_DATASET.csv",  # Adjusted path for execution outside 'scripts'
    "window_size": 5,
    "test_size": 0.2,
    "n_estimators": 100,
    "random_state": 42,
    "target_opset": {"": 15, "ai.onnx.ml": 3},
    "anomaly_label": -1,
    "normal_label": 1,
}
RTM_MODEL_NAME = "SGT400-RTM-Anomaly-Model"


def train_rtm_model(cfg: dict):
    """
    Trains the RTM RandomForest model, logs parameters and metrics to MLflow,
    and registers the ONNX model.
    """
    # --- MLflow Setup ---
    mlflow.set_tracking_uri(config.MLFLOW_TRACKING_URI)
    mlflow.set_experiment(RTM_MODEL_NAME)

    with mlflow.start_run() as run:
        # 1. Logging Hyperparameters
        mlflow.log_params(
            {
                "model_type": "RandomForest_RTM",
                "window_size": cfg["window_size"],
                "test_size": cfg["test_size"],
                "n_estimators": cfg["n_estimators"],
                "random_state": cfg["random_state"],
                "target_opset": cfg["target_opset"],
            }
        )

        # 2. Data Loading
        logger.info(f"Loading data from {cfg['data_path']}...")
        df = pd.read_csv(cfg["data_path"])
        logger.info("✅ Data loaded successfully. Starting preprocessing.")

        # 3. Feature Engineering
        df["Vibration_roll_mean"] = (
            df["Vibration"].rolling(window=cfg["window_size"]).mean()
        )
        df["Power_Consumption_roll_mean"] = (
            df["Power_Consumption"].rolling(window=cfg["window_size"]).mean()
        )
        df["Vibration_roll_std"] = (
            df["Vibration"].rolling(window=cfg["window_size"]).std()
        )
        df["Power_Consumption_roll_std"] = (
            df["Power_Consumption"].rolling(window=cfg["window_size"]).std()
        )

        # Fill NaN values created by rolling window
        df.bfill(inplace=True)
        df.ffill(inplace=True)

        FEATURE_COLUMNS = config.RTM_FEATURE_COLUMNS

        # 4. Prepare Data & Scaling
        X = df[FEATURE_COLUMNS]
        # Convert 'Status' column to numerical labels (-1: Anomaly, 1: Normal)
        y = df["Status"].apply(
            lambda x: cfg["normal_label"] if x == "Normal" else cfg["anomaly_label"]
        )

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=cfg["test_size"],
            random_state=cfg["random_state"],
            stratify=y,
        )

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        logger.info("✅ Data split and scaled successfully.")

        # 5. Train Model
        model = RandomForestClassifier(
            n_estimators=cfg["n_estimators"],
            random_state=cfg["random_state"],
            n_jobs=-1,
        )
        logger.info("\n--- Starting Model Training ---")
        model.fit(X_train_scaled, y_train)
        logger.info("--- Training Complete ---")

        # 6. Evaluation and Metrics Logging
        y_pred = model.predict(X_test_scaled)
        report = classification_report(y_test, y_pred, output_dict=True)

        # Extract key metrics for Anomaly (-1)
        anomaly_metrics = report[str(cfg["anomaly_label"])]
        f1 = anomaly_metrics["f1-score"]
        recall = anomaly_metrics["recall"]

        mlflow.log_metric("f1_score_anomaly", f1)
        mlflow.log_metric("recall_anomaly", recall)
        logger.info(
            f"✅ Logged F1-score (Anomaly): {f1:.4f}, Recall (Anomaly): {recall:.4f}"
        )

        # 7. ONNX Conversion and Artifact Logging
        logger.info("\n--- Converting Model to ONNX and Logging Artifacts ---")

        # Convert the trained scikit-learn model to ONNX
        onnx_model_filename = "rtm_random_forest_model.onnx"  # Renamed for clarity
        initial_type = [("input", FloatTensorType([None, len(FEATURE_COLUMNS)]))]
        onnx_model = skl2onnx.convert_sklearn(
            model, initial_types=initial_type, target_opset=cfg["target_opset"]
        )

        temp_dir = "./temp_mlflow_artifacts"  # Use a dedicated temporary directory
        os.makedirs(temp_dir, exist_ok=True)
        temp_onnx_path = os.path.join(temp_dir, onnx_model_filename)

        with open(temp_onnx_path, "wb") as f:
            f.write(onnx_model.SerializeToString())

        # Log the ONNX model artifact
        mlflow.log_artifact(temp_onnx_path, "model")
        logger.info("✅ ONNX model saved to MLflow artifacts folder.")

        # Save Scaler parameters and log them
        # These parameters are required for inference (rtm-consumer)
        np.save(os.path.join(temp_dir, "rtm_scaler_mean.npy"), scaler.mean_)
        np.save(os.path.join(temp_dir, "rtm_scaler_scale.npy"), scaler.scale_)
        mlflow.log_artifact(
            os.path.join(temp_dir, "rtm_scaler_mean.npy"), "scaler_params"
        )
        mlflow.log_artifact(
            os.path.join(temp_dir, "rtm_scaler_scale.npy"), "scaler_params"
        )
        logger.info("✅ Scaler parameters saved to MLflow artifacts folder.")

        # Save the original Sklearn model (for interpretability/SHAP) and log it
        temp_sklearn_path = os.path.join(temp_dir, "rtm_random_forest.joblib")
        joblib.dump(model, temp_sklearn_path)
        mlflow.log_artifact(temp_sklearn_path, "sklearn_model")
        logger.info("✅ Sklearn model saved for interpretability.")

        # 8. Register the Model (We register the ONNX model)
        # We need an input example for the signature
        input_example = X_test_scaled[:1].astype(
            np.float32
        )  # Use scaled data for input example
        signature = infer_signature(input_example, np.array([y_pred[0]]))

        logged_model_info = mlflow.register_model(
            # The model_uri points to the ONNX file logged in the 'model' artifact folder
            model_uri=f"runs:/{run.info.run_id}/model/{onnx_model_filename}",
            name=RTM_MODEL_NAME,
            tags={"model_type": "RandomForest_RTM", "format": "ONNX"},
            signature=signature,
        )
        logger.info(f"✅ Model registered as version: {logged_model_info.version}")

        # 9. Cleanup
        os.remove(temp_onnx_path)
        os.remove(temp_sklearn_path)
        os.remove(os.path.join(temp_dir, "rtm_scaler_mean.npy"))
        os.remove(os.path.join(temp_dir, "rtm_scaler_scale.npy"))
        os.rmdir(temp_dir)


if __name__ == "__main__":
    # In a real environment, you would ensure 'backend.core.config' is imported correctly
    # and the paths are correct relative to where the script is executed.
    # The CONFIG dictionary is used here as a placeholder for the actual configuration.
    try:
        train_rtm_model(CONFIG)
    except FileNotFoundError as e:
        logger.error(
            f"Error: Data file not found. Please ensure the path is correct: {e}"
        )
        logger.error(
            "If running from 'scripts/' folder, make sure '../datasets/MASTER_DATASET.csv' exists."
        )
