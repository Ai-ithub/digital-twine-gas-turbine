import os
import logging
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.impute import KNNImputer
from pykalman import KalmanFilter
import pickle
import tensorflow as tf
from keras.models import Sequential
from keras.layers import LSTM, Dense, Input
from keras.callbacks import EarlyStopping
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import tf2onnx
from tqdm import tqdm
import mlflow
from mlflow.models import infer_signature


# --- Dummy backend.core for MLflow URI (Replace with actual import in real project) ---
class MockConfig:
    MLFLOW_TRACKING_URI = "sqlite:///mlruns.db"  # Example local tracking URI


config = MockConfig()
# -----------------------------------------------------------------------------------

# --- 1. Setup Logging and Configuration ---
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# --- Configuration (MERGED) ---
CONFIG = {
    # MLOps data path is kept with fallback logic in load_and_preprocess_data
    "data_path": "data/training_data/retraining_dataset_pdm.parquet",
    "artifacts_path": "artifacts", 
    # Optimizations from PR for performance improvement:
    "window_size": 120,  # Increased from 60
    "test_size": 0.2,
    "kalman_filter_columns": [
        "Pressure_In",
        "Temperature_In",
        "Vibration",
        "Temperature_Out",
    ],
    "target_column": "Label",
    "epochs": 100,  # Increased from 50
    "batch_size": 64,  # Reduced from 128
    "lstm_units": [128, 64],  # Multi-layer LSTM
    "dropout": 0.2,
    "recurrent_dropout": 0.2,
    # Kept for MLflow logging:
    "optimizer": "adam",
}
RUL_MODEL_NAME = "SGT400-RUL-Prediction-Model"


# --- 2. Data Loading and Preprocessing ---
def load_and_preprocess_data(config: dict):
    logger.info(f"Reading dataset from {config['data_path']}...")
    # Improved data loading logic to support Parquet and Fallback
    try:
        df = pd.read_parquet(config["data_path"])
    except FileNotFoundError:
        logger.error(
            f"❌ Dataset not found at {config['data_path']}. Falling back to default CSV."
        )
        # Using the old CSV path
        df = pd.read_csv("datasets/MASTER_DATASET.csv")

    logger.info("Dataset read successfully. Starting preprocessing...")

    logger.info("Applying Kalman Filter...")
    for col in tqdm(config["kalman_filter_columns"], desc="Applying Kalman Filter"):
        kf = KalmanFilter(initial_state_mean=df[col].mean(), n_dim_obs=1)
        # Using .em() for Expectation Maximization to estimate parameters
        em_kf = kf.em(df[col].values)
        smoothed_values = em_kf.smooth(df[col].values)[0]
        df[col] = smoothed_values.flatten()

    logger.info("Handling missing values with KNNImputer...")
    numeric_cols = df.select_dtypes(include=np.number).columns
    imputer = KNNImputer(n_neighbors=3)
    df[numeric_cols] = imputer.fit_transform(df[numeric_cols])

    logger.info("Preprocessing complete.")
    feature_cols = [
        col for col in numeric_cols if col not in [config["target_column"], "Time"]
    ]
    return df, feature_cols


# --- 3. Feature Engineering and Model Training (MERGED) ---
def train_rul_model(config: dict):
    # --- MLflow Setup ---
    mlflow.set_tracking_uri(config.MLFLOW_TRACKING_URI)
    mlflow.set_experiment(RUL_MODEL_NAME)

    with mlflow.start_run() as run:
        # 1. Logging Hyperparameters
        # Log the entire config dictionary, which now includes all parameters
        mlflow.log_params(config)

        # 2. Data Preparation
        df, feature_cols = load_and_preprocess_data(config)
        if df is None:
            return

        logger.info("Scaling features...")
        scaler = StandardScaler()
        df[feature_cols] = scaler.fit_transform(df[feature_cols])

        logger.info(f"Creating sequences with window size {config['window_size']}...")

        def create_sequences(data, labels, window_size):
            Xs, ys = [], []
            for i in tqdm(range(len(data) - window_size), desc="Creating Sequences"):
                Xs.append(data[i : i + window_size])
                ys.append(labels[i + window_size])
            return np.array(Xs, dtype=np.float32), np.array(ys, dtype=np.float32)

        X, y = create_sequences(
            df[feature_cols].values,
            df[config["target_column"]].values,
            config["window_size"],
        )

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=config["test_size"], shuffle=False
        )
        logger.info(
            f"Train/Test split complete. Train shape: {X_train.shape}, Test shape: {X_test.shape}"
        )

        # 3. Model Definition and Training
        n_timesteps, n_features = X_train.shape[1], X_train.shape[2]
        
        # --- OPTIMIZED: Multi-layer LSTM with dropout (from Elham_kokabidana) ---
        model = Sequential([
            Input(shape=(n_timesteps, n_features)),
            LSTM(config["lstm_units"][0], 
                 activation="relu", 
                 return_sequences=True,
                 dropout=config["dropout"],
                 recurrent_dropout=config["recurrent_dropout"]),
            LSTM(config["lstm_units"][1], 
                 activation="relu",
                 dropout=config["dropout"],
                 recurrent_dropout=config["recurrent_dropout"]),
            Dense(1)
        ])
        model.compile(optimizer=config["optimizer"], loss="mean_squared_error") # Use config["optimizer"]

        early_stopping = EarlyStopping(
            monitor="val_loss", patience=5, restore_best_weights=True
        )

        logger.info("\n--- Starting Model Training ---")
        history = model.fit( # Store history to log val_loss
            X_train,
            y_train,
            epochs=config["epochs"],
            batch_size=config["batch_size"],
            validation_split=0.2,
            callbacks=[early_stopping],
            verbose=1, # Set verbose to 1 for more detail during training
        )
        logger.info("--- Training Complete ---")

        # 4. Evaluation and Metrics Logging
        logger.info("\n--- Evaluating Model Performance ---")
        y_pred = model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        val_loss = history.history["val_loss"][-1] # Log final val_loss

        mlflow.log_metric("mae", mae)
        mlflow.log_metric("r2_score", r2)
        mlflow.log_metric("validation_loss", val_loss)
        logger.info(f"✅ Logged MAE: {mae:.4f}, R2: {r2:.4f}, Val Loss: {val_loss:.4f}")

        # 5. ONNX Conversion and Artifact Logging (MERGED)
        logger.info("\n--- Converting Model to ONNX and Logging Artifacts ---")
        onnx_model_path = "rul_model.onnx"

        # ONNX Conversion Logic (from Elham_kokabidana - corrected for Functional model)
        input_tensor = tf.keras.Input(
            shape=(n_timesteps, n_features), name="input_layer"
        )
        output_tensor = model(input_tensor)
        functional_model = tf.keras.Model(
            inputs=input_tensor, outputs=output_tensor, name="rul_model"
        )
        input_signature = [
            tf.TensorSpec(
                [None, n_timesteps, n_features], tf.float32, name="input_layer"
            )
        ]

        try:
            model_proto, _ = tf2onnx.convert.from_keras(
                functional_model, input_signature, opset=13
            )
        except Exception as e:
            logger.error(f"❌ An error occurred during ONNX conversion: {e}")
            return

        # Save Artifacts to local temp directory before logging to MLflow
        temp_dir = "./temp_artifacts"
        os.makedirs(temp_dir, exist_ok=True)
        temp_onnx_path = os.path.join(temp_dir, onnx_model_path)
        with open(temp_onnx_path, "wb") as f:
            f.write(model_proto.SerializeToString())

        # Save Scaler
        scaler_path = os.path.join(temp_dir, "rul_scaler.pkl")
        with open(scaler_path, "wb") as f:
            pickle.dump(scaler, f)

        # 6. MLflow Logging and Registration
        mlflow.log_artifact(temp_onnx_path, "model")
        logger.info("✅ ONNX model logged to MLflow artifacts folder.")
        mlflow.log_artifact(scaler_path, "scaler")
        logger.info("✅ Scaler logged to MLflow artifacts folder.")

        # Infer model signature for registration
        signature = infer_signature(X_test, y_pred.flatten())

        # Register the model to the MLflow Model Registry
        logged_model_info = mlflow.register_model(
            model_uri=f"runs:/{run.info.run_id}/model/{onnx_model_path}",
            name=RUL_MODEL_NAME,
            tags={"model_type": "LSTM_RUL", "format": "ONNX"},
            signature=signature,
        )
        logger.info(f"✅ Model registered as version: {logged_model_info.version}")

        # Cleanup
        os.remove(temp_onnx_path)
        os.remove(scaler_path)
        os.rmdir(temp_dir)


if __name__ == "__main__":
    # Ensure the artifacts directory exists for local operations (optional but good practice)
    os.makedirs(CONFIG["artifacts_path"], exist_ok=True)
    train_rul_model(CONFIG) # Use the merged CONFIG