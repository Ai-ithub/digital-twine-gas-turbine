# backend/core/prediction_logger.py

import pymysql
import logging
import json

logger = logging.getLogger(__name__)


def log_prediction(db_config, model_version, input_data, prediction, latency_ms):
    """Logs a prediction event to the MySQL database."""
    try:
        conn = pymysql.connect(**db_config)
        with conn.cursor() as cursor:
            sql = """
                INSERT INTO prediction_logs 
                (model_version, input_data, prediction_result, latency_ms)
                VALUES (%s, %s, %s, %s)
            """
            # Convert dicts/numpy arrays to JSON strings for storage
            input_str = json.dumps(input_data, default=str)
            output_str = json.dumps(prediction, default=str)

            cursor.execute(sql, (model_version, input_str, output_str, latency_ms))
        conn.commit()
    except Exception as e:
        logger.error(f"Failed to log prediction to MySQL: {e}")
    finally:
        if conn:
            conn.close()
