# MLflow Setup Guide

Guide to configuring and using MLflow for model versioning and experiment tracking.

## 📋 Configuration

### Environment Variables

Add to `.env`:

```env
MLFLOW_TRACKING_URI=http://mlflow:5000
MLFLOW_EXPERIMENT_NAME=Digital-Twin-Models
```

## 🚀 Usage

### Logging a Model

```python
from backend.core.mlflow_tracker import get_mlflow_tracker

tracker = get_mlflow_tracker()

tracker.log_model(
    model_name="RUL",
    model_type="onnx",
    model_path="artifacts/rul_model.onnx",
    model_version="v1.2.0",
    metrics={"MAE": 0.28, "R2": 0.72},
    parameters={"epochs": 100, "batch_size": 64},
    tags={"training_dataset": "2024-01-01"},
)
```

### Logging Dataset Version

```python
tracker.log_data_version(
    dataset_name="MASTER_DATASET",
    dataset_path="datasets/MASTER_DATASET.csv",
    dataset_hash="sha256:abc123...",
    description="Updated dataset with new sensor readings",
)
```

## 🌐 Access

The MLflow UI is available at:
- **URL:** http://localhost:5001
- **Tracking URI:** http://mlflow:5000

## 📊 Features

- ✅ Model versioning
- ✅ Experiment tracking
- ✅ Dataset versioning
- ✅ Metrics logging
- ✅ Parameters tracking

