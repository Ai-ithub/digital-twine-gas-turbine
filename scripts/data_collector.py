# scripts/data_collector.py

import os
import logging
import datetime as dt
import pandas as pd
import pymysql
from dotenv import load_dotenv
from influxdb_client import InfluxDBClient
from influxdb_client.client.exceptions import InfluxDBError
from influxdb_client.client.query_api import QueryApi
from backend.core import config  # Using MLflow settings and feature lists

# 1. Settings and logging
load_dotenv()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# 2. Environmental variables
INFLUXDB_URL = os.getenv("INFLUXDB_URL", "http://influxdb:8086")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")

MYSQL_HOST = os.getenv("DB_HOST", "mysql")
MYSQL_PORT = int(os.getenv("DB_PORT", 3306))
MYSQL_USER = os.getenv("DB_USER")
MYSQL_PASSWORD = os.getenv("DB_PASSWORD")
MYSQL_DATABASE = os.getenv("DB_DATABASE")

# 3. Data collection functions


def fetch_influxdb_data(query_api: QueryApi, days_ago: int = 30) -> pd.DataFrame:
    """
    Fetches raw sensor data for the specified time period (e.g., the last 30 days) from InfluxDB.
    """
    logging.info(f"Connecting to InfluxDB at: {INFLUXDB_URL}")

    # Definition of time interval
    start_time = (dt.datetime.utcnow() - dt.timedelta(days=days_ago)).isoformat() + "Z"

    # Build Flux Query
    # ​​Assume all sensors are in the same Bucket and Measurement
    flux_query = f'''
    from(bucket: "{INFLUXDB_BUCKET}")
      |> range(start: {start_time})
      |> filter(fn: (r) => r._measurement == "sensor_readings")
      |> pivot(rowKey:["_time"], columnKey:["_field"], valueColumn:"_value")
      |> keep(columns: ["_time", "_value"] + {config.RUL_MODEL_FEATURES})
    '''

    try:
        logging.info(f"Fetching data from the last {days_ago} days...")
        # Run a query and convert to a DataFrame
        data_frames = query_api.query_data_frame(flux_query)

        if isinstance(data_frames, list) and data_frames:
            # If multiple tables are returned (which is common), we merge them together.
            df = pd.concat(data_frames, ignore_index=True)
        elif isinstance(data_frames, pd.DataFrame):
            df = data_frames
        else:
            logging.warning("No data found in InfluxDB for the specified period.")
            return pd.DataFrame()

        # Cleaning the columns
        df = df.rename(columns={"_time": "Timestamp"}).drop(
            columns=["result", "table"], errors="ignore"
        )
        df["Timestamp"] = pd.to_datetime(df["Timestamp"])

        logging.info(
            f"✅ Successfully fetched {len(df)} rows of time-series data from InfluxDB."
        )
        return df.set_index("Timestamp").sort_index()

    except InfluxDBError as e:
        logging.error(f"InfluxDB Error: {e}")
        return pd.DataFrame()
    except Exception as e:
        logging.error(f"An unexpected error occurred during InfluxDB fetch: {e}")
        return pd.DataFrame()


def fetch_mysql_labels(start_time: dt.datetime) -> pd.DataFrame:
    """
    Fetch event logs (such as repair and crash records) from MySQL.
    """
    logging.info(f"Connecting to MySQL at: {MYSQL_HOST}:{MYSQL_PORT}")

    # Let's assume there is a table called 'maintenance_logs' for RUL tagging.
    query = f"""
        SELECT 
            Timestamp, Event_Type, Component_ID
        FROM maintenance_logs 
        WHERE Timestamp >= '{start_time.strftime("%Y-%m-%d %H:%M:%S")}'
        ORDER BY Timestamp
    """

    try:
        conn = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE,
            cursorclass=pymysql.cursors.DictCursor,
        )
        with conn.cursor() as cursor:
            cursor.execute(query)
            data = cursor.fetchall()
            df = pd.DataFrame(data)
        conn.close()

        if not df.empty:
            logging.info(
                f"✅ Successfully fetched {len(df)} maintenance events from MySQL."
            )
            df["Timestamp"] = pd.to_datetime(df["Timestamp"])
            return df.set_index("Timestamp").sort_index()
        else:
            logging.warning("No new maintenance logs found in MySQL.")
            return pd.DataFrame()

    except Exception as e:
        logging.error(f"MySQL Error: {e}")
        logging.error(
            "Ensure MySQL container is running and environment variables are set."
        )
        return pd.DataFrame()


def run_data_collector(
    days_ago: int = 30, output_path: str = "data/retraining_dataset.parquet"
):
    """
    Coordinates data fetching and integration.
    """

    if not INFLUXDB_TOKEN:
        logging.error("INFLUXDB_TOKEN environment variable is not set. Cannot proceed.")
        return

    # 1. Connecting to InfluxDB
    influx_client = InfluxDBClient(
        url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG
    )
    query_api = influx_client.query_api()

    # 2. Fetching raw sensor data
    sensor_df = fetch_influxdb_data(query_api, days_ago=days_ago)

    if sensor_df.empty:
        logging.info("Exiting data collector: No sensor data fetched.")
        return

    # 3. Fetch event logs from MySQL
    start_time_mysql = sensor_df.index.min().to_pydatetime()
    label_df = fetch_mysql_labels(start_time=start_time_mysql)

    # 4. Merge and Preprocessing
    # Note: The preprocessing logic and RUL (Remaining Useful Life) labeling
    # Due to complexity, it should be done in a separate script (e.g. train_rul_model.py).
    # Here we just merge the data for simplicity.

    final_df = sensor_df.merge(label_df, left_index=True, right_index=True, how="left")
    final_df = final_df.fillna({"Event_Type": "Normal", "Component_ID": "N/A"})

    # 5. Storage
    output_dir = os.path.dirname(output_path)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Using Parquet for efficient storage
    final_df.to_parquet(output_path, index=True)

    logging.info(
        f"✅ Training dataset successfully created and saved to: {output_path}"
    )
    logging.info(f"Final dataset shape: {final_df.shape}")

    influx_client.close()


if __name__ == "__main__":
    # Can be run non-interactively
    run_data_collector(
        days_ago=365, output_path="data/training_data/retraining_dataset_pdm.parquet"
    )
