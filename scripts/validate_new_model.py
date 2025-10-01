# scripts/validate_new_model.py

import os
import logging
import argparse
import pandas as pd
import numpy as np
import mlflow
from mlflow.tracking import MlflowClient
from sklearn.metrics import mean_absolute_error, f1_score, recall_score
from backend.core import config # Access to MLFLOW_TRACKING_URI

# --- General settings ---
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# --- MLflow model names (based on project standard) ---
RTM_MODEL_NAME = "SGT400-RTM-Anomaly-Model"
RUL_MODEL_NAME = "SGT400-RUL-Prediction-Model"

# --- Upgrade Threshold ---
# Criteria: The new model must be at least 1% better than the Production model.
PROMOTION_THRESHOLD_RTM = 0.01 # For F1-score and Recall
PROMOTION_THRESHOLD_RUL = 0.01 # For MAE (1% reduction)
TEST_DATA_PATH = "data/training_data/test_dataset.parquet"


def load_test_data(model_type: str) -> tuple[np.ndarray, np.ndarray]:
    """
    Loads the test dataset.

    In a real environment, this dataset should be a held-out dataset.
    """
    logging.info(f"Loading test data from {TEST_DATA_PATH}...")
    try:
        # Assumption: The test data and real labels in this Parquet file are
        # Mock data is created for simplicity.
        data = pd.read_parquet(TEST_DATA_PATH)
    except FileNotFoundError:
        logging.warning("Test dataset not found. Generating mock data for demonstration.")
        # Create dummy data with the required size and columns
        if model_type == 'RTM':
            features = np.random.rand(1000, len(config.RTM_FEATURE_COLUMNS)).astype(np.float32)
            # Labels: 0 (normal) or 1 (abnormal)
            labels = np.random.randint(0, 2, 1000) 
            return features, labels
        elif model_type == 'RUL':
            features = np.random.rand(1000, len(config.RUL_MODEL_FEATURES)).astype(np.float32)
            # Tags: Actual RUL (e.g. between 0 and 300)
            labels = np.random.uniform(0, 300, 1000) 
            return features, labels
        else:
            raise ValueError(f"Unknown model type: {model_type}")

    # Here, the logic of loading the actual data and extracting features/labels comes in.
    if model_type == 'RTM':
        X = data[config.RTM_FEATURE_COLUMNS].values.astype(np.float32)
        Y = data['Anomaly_Label'].values # Assumption: RTM label column
    else: # RUL
        X = data[config.RUL_MODEL_FEATURES].values.astype(np.float32)
        Y = data['RUL_Days'].values # Assumption: RUL label column
        
    return X, Y


def evaluate_model(model_uri: str, X_test: np.ndarray, Y_true: np.ndarray, model_type: str) -> dict:
    """
    Loads the model from MLflow and evaluates its performance.
    """
    metrics = {}
    try:
        # Loading the model using the MLflow load_model method
        logged_model = mlflow.onnx.load_model(model_uri=model_uri)
        # Assumption: ONNX models require onnxruntime for inference.
        import onnxruntime
        sess = onnxruntime.InferenceSession(logged_model.SerializeToString())
        
        # Forecast
        input_name = sess.get_inputs()[0].name
        output_name = sess.get_outputs()[0].name
        Y_pred = sess.run([output_name], {input_name: X_test})[0]
        
        if model_type == 'RTM':
            # Convert output to binary predictions (0 or 1)
            Y_pred_binary = (Y_pred > 0.5).astype(int) 
            metrics['F1_score'] = f1_score(Y_true, Y_pred_binary)
            metrics['Recall'] = recall_score(Y_true, Y_pred_binary)
            logging.info(f"RTM Metrics: F1={metrics['F1_score']:.4f}, Recall={metrics['Recall']:.4f}")
            
        elif model_type == 'RUL':
            # RUL یک رگرسیون است
            metrics['MAE'] = mean_absolute_error(Y_true, Y_pred.flatten())
            logging.info(f"RUL Metrics: MAE={metrics['MAE']:.2f} days")

    except Exception as e:
        logging.error(f"Error evaluating model {model_uri}: {e}")
        return None
        
    return metrics


def validate_and_promote(model_type: str, candidate_version: int):
    """
    Evaluates the candidate model against the current Production model and decides to upgrade.
    """
    model_name = RTM_MODEL_NAME if model_type == 'RTM' else RUL_MODEL_NAME
    logging.info(f"--- Starting validation for {model_name} (Candidate v{candidate_version}) ---")
    
    # Setting MLflow Tracking URI
    mlflow.set_tracking_uri(config.MLFLOW_TRACKING_URI)
    client = MlflowClient()

    # 1. Find the current Production model
    try:
        prod_version = client.get_latest_versions(model_name, stages=["Production"])[0]
    except Exception:
        # If the Production model does not exist, the candidate model is automatically promoted.
        logging.warning(f"No existing Production model found for {model_name}. Auto-promoting candidate.")
        return "PROMOTE"

    # 2. Defining URI models
    prod_uri = f"models:/{model_name}/Production"
    candidate_uri = f"models:/{model_name}/{candidate_version}"
    
    # 3. Loading the test dataset
    X_test, Y_true = load_test_data(model_type)
    if X_test.size == 0:
        logging.error("Test data is empty. Cannot perform validation.")
        return "REJECT"

    # 4. Production Model Evaluation
    prod_metrics = evaluate_model(prod_uri, X_test, Y_true, model_type)
    if prod_metrics is None:
        logging.error("Failed to evaluate Production model. Cannot compare.")
        return "REJECT"
    
    # 5. Candidate Model Evaluation
    candidate_metrics = evaluate_model(candidate_uri, X_test, Y_true, model_type)
    if candidate_metrics is None:
        logging.error("Failed to evaluate Candidate model.")
        return "REJECT"

    # 6. Promotion decision making
    if model_type == 'RTM':
        # RTM Criteria: F1 and Recall must be better
        f1_improvement = candidate_metrics['F1_score'] - prod_metrics['F1_score']
        recall_improvement = candidate_metrics['Recall'] - prod_metrics['Recall']
        
        # If both criteria have improved by the threshold amount
        if f1_improvement >= PROMOTION_THRESHOLD_RTM and recall_improvement >= PROMOTION_THRESHOLD_RTM:
            logging.info(f"SUCCESS: RTM Candidate shows significant improvement (F1: +{f1_improvement:.4f}, Recall: +{recall_improvement:.4f})")
            return "PROMOTE"
        else:
            logging.info(f"FAIL: RTM Candidate did not meet promotion threshold (F1 change: {f1_improvement:.4f}, Recall change: {recall_improvement:.4f})")
            return "REJECT"
            
    elif model_type == 'RUL':
        # RUL criterion: MAE should be reduced (improved)
        mae_reduction = prod_metrics['MAE'] - candidate_metrics['MAE']
        relative_reduction = mae_reduction / prod_metrics['MAE'] if prod_metrics['MAE'] else 0
        
        if relative_reduction >= PROMOTION_THRESHOLD_RUL:
            logging.info(f"SUCCESS: RUL Candidate shows significant improvement. MAE reduced by {relative_reduction:.2%} (Absolute: {mae_reduction:.2f} days)")
            return "PROMOTE"
        else:
            logging.info(f"FAIL: RUL Candidate MAE reduction ({relative_reduction:.2%}) is below {PROMOTION_THRESHOLD_RUL:.2%} threshold.")
            return "REJECT"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Automated ML Model Validation and Promotion Script.")
    parser.add_argument("--model_type", type=str, required=True, choices=['RTM', 'RUL'],
                        help="Type of model to validate (RTM or RUL).")
    parser.add_argument("--candidate_version", type=int, required=True,
                        help="MLflow version number of the newly trained model candidate.")
    
    args = parser.parse_args()
    
    result = validate_and_promote(args.model_type, args.candidate_version)
    
    print(f"\n--- Validation Result: {result} ---")
    
    # This sets the exit code for orchestration tools.
    if result == "PROMOTE":
        exit(0) # Success
    else:
        exit(1) # Failure