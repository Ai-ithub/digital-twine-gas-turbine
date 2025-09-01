from fastapi import FastAPI
import uvicorn
import sqlite3
from datetime import datetime
import time
import os

app = FastAPI()

# مسیر logs.db (چون تو ریشه پروژه‌ست)
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs.db")
print("DB_PATH:", DB_PATH)
def log_prediction(input_data, output_data, model_version, latency):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO prediction_logs (input, output, model_version, latency)
    VALUES (?, ?, ?, ?)
    """, (str(input_data), str(output_data), model_version, latency))
    conn.commit()
    conn.close()

@app.post("/predict")
def predict(data: dict):
    start_time = time.time()
    
    output = {"result": "Task 3.3 prediction"}
    latency = time.time() - start_time
    log_prediction(data, output, "v1.0", latency)
    return output

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)  