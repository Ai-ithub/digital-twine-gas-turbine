# Log Table Design

## Table Schema
The `prediction_logs` table is designed to store prediction logs with the following fields:
- `id`: Auto-incrementing identifier (INTEGER, PRIMARY KEY)
- `input`: Model input data (TEXT)
- `output`: Model output data (TEXT)
- `model_version`: Model version used for prediction (TEXT)
- `timestamp`: Time of prediction (DATETIME, defaults to CURRENT_TIMESTAMP)
- `latency`: Prediction latency in seconds (REAL)

**Reason for fields**: These fields meet the requirements for logging inputs, outputs, model version, and timestamp as per the task checklist. The `latency` field is added to track performance metrics.

## API Architecture
- File: `backend/api/predict_api.py`
- Endpoint: `POST /predict`
- Functionality: Accepts JSON input, generates a prediction, logs the input, output, model version, and latency to the `prediction_logs` table, and returns the prediction as JSON.

## Log Analysis Script
- File: `scripts/analyze_logs.py`
- Functionality: Periodically queries the `prediction_logs` table to compute key metrics:
  - Average latency of predictions.
  - Distribution of outputs to detect potential model bias (warns if any output exceeds 80% of logs).
- Purpose: Monitors model performance and identifies potential issues like bias in predictions.