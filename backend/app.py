# from flask import Flask, jsonify
# from database import CompressorDatabase  # Import database class
# from vibration_predictor import VibrationPredictor  # Import prediction class
# from onnxPredictor import ONNXPredictor
# from model_class import CompressorStatusPredictor

# # Initialize the database connection
# db_config = {
#     "host": "localhost",
#     "user": "root",
#     "password": "f1309D1309",
#     "database": "compressor_db",
#     "table": "compressor_data"
# }


# MODEL_PATH = "compressor_status_prediction_model.onnx"
# # Create instances of the database and predictor
# db = CompressorDatabase(**db_config)
# predictor = VibrationPredictor(db_config=db_config)
# predictor_status = CompressorStatusPredictor(db_config, MODEL_PATH)


# # Initialize Flask app
# app = Flask(__name__)

# @app.route('/get_all_data', methods=['GET'])
# def get_all_data():
#     """Retrieve all data from the database including all columns."""
#     if not db.connect():
#         return jsonify({"error": "Failed to connect to database"}), 500
    
#     # Query to get all columns
#     query = f"""
#         SELECT * FROM {db.table} ORDER BY TimeData ASC
#     """
    
#     if not db.load_data(query=query):
#         return jsonify({"error": "Failed to load data"}), 500

#     return jsonify(db._data)  # Return all database records with all columns

# @app.route('/predict_all', methods=['GET'])
# def predict_all():
#     """Returns all vibration predictions as JSON."""
#     if not predictor.initialize():
#         return jsonify({"error": "Failed to initialize predictor"}), 500
    
#     results = predictor.predict_all()
#     if not results:
#         return jsonify({"message": "No predictions available"}), 404
    
#     return jsonify(results)


# @app.route('/dart_predictions')
# def dart_predictions():
#     onnx_model_path = "dart_model.onnx"  # Path to the ONNX model
    
#     # Database configuration
#     db_host = "localhost"
#     db_user = "root"
#     db_password = "f1309D1309"
#     db_name = "compressor_db"
#     db_table = "compressor_data"
    
#     # Create a predictor object
#     predictor = ONNXPredictor(onnx_model_path, db_host, db_user, db_password, db_name, db_table)
#     predicted_values = predictor.predict_all_values()

#     if not predicted_values:
#         return jsonify ({{"message": "No predictions available"}})
    
#     # Print the predicted values
#     # for idx, predicted_value in enumerate(predicted_values):
#     #     return jsonify (f"Predicted Next Vibration Value for Entry {idx + 1}: {predicted_value}")

#     predictions_list = [{"Entry": idx + 1, "Predicted Value": float(value)} for idx, value in enumerate(predicted_values)]
#     return jsonify ({"Dart Predictions":predictions_list})



# # @app.route('/predict', )
# # def predict():
# #     """Endpoint برای پیش‌بینی وضعیت کمپرسور."""
# #     prediction = predictor_status.predict()
# #     return jsonify({"predicted status : ", prediction})


# if __name__ == '__main__':
#     app.run(debug=True, port=5000, host='0.0.0.0')



# from flask import Flask, jsonify
# from database import CompressorDatabase  # Import database class
# from vibration_predictor import VibrationPredictor  # Import prediction class
# from Anomaly_Detection import AnomalyDetector # Import the new AnomalyDetector class
# from onnxPredictor import ONNXPredictor
# from model_class import CompressorStatusPredictor
# import logging
# from flask_cors import CORS


# # Setup logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # اطلاعات اتصال به دیتابیس
# db_config = {
#     "host": "MYSQL1001.site4now.net",  # آدرس سرور MySQL
#     "user": "ab377b_faridka",          # نام کاربری شما
#     "password": "f1309D1309",    # رمز عبور شما (جایگزین کنید)
#     "database": "db_ab377b_faridka"    # نام دیتابیس شما
# }

# MODEL_PATH = "compressor_status_prediction_model.onnx"

# # Initialize Flask app
# app = Flask(__name__)
# CORS(app)


# @app.route('/get_all_data', methods=['GET'])
# def get_all_data():
#     """Retrieve all data from the database."""
#     db = CompressorDatabase(**db_config)
    
#     if not db.connect():
#         return jsonify({"error": "Failed to connect to database"}), 500
    
#     if not db.load_data():
#         db.close()
#         return jsonify({"error": "Failed to load data"}), 500

#     data = db._data  # Fetch loaded data
#     db.close()
#     return jsonify(data)


# @app.route('/predict_all', methods=['GET'])
# def predict_all():
#     """Returns all vibration predictions as JSON."""
#     predictor = VibrationPredictor(db_config=db_config)
    
#     if not predictor.initialize():
#         return jsonify({"error": "Failed to initialize predictor"}), 500
    
#     results = predictor.predict_all()
    
#     if not results:
#         return jsonify({"message": "No predictions available"}), 404
    
#     return jsonify(results)


# @app.route('/dart_predictions', methods=['GET'])
# def dart_predictions():
#     onnx_model_path = "dart_model.onnx"  # Path to the ONNX model
    
#     # Database configuration
#     db_host = "MYSQL1001.site4now.net"
#     db_user = "ab377b_faridka"
#     db_password = "f1309D1309"
#     db_name = "db_ab377b_faridka"
#     db_table = "compressor_data"
    
#     # Create a predictor object
#     predictor = ONNXPredictor(onnx_model_path, db_host, db_user, db_password, db_name, db_table)
    
#     predicted_values = predictor.predict_all_values()

#     if not predicted_values:
#         return jsonify({"message": "No predictions available"}), 404
    
#     predictions_list = [{"Entry": idx + 1, "Predicted Value": float(value)} for idx, value in enumerate(predicted_values)]
    
#     return jsonify({"Dart Predictions": predictions_list})


# @app.route('/predict_status', methods=['GET'])
# def predict_status():
#     """Predicts compressor status using ONNX model."""
#     predictor_status = CompressorStatusPredictor(db_config, MODEL_PATH)
    
#     prediction = predictor_status.predict()
    
#     if prediction is None:
#         return jsonify({"error": "Prediction failed"}), 500
    
#     return jsonify({"Predicted Status": prediction})




# @app.route('/detect_anomaly', methods=['GET'])
# def detect_anomaly():
#     """Detect anomalies using the latest data."""
#     try:
#         # مسیر مدل ONNX برای تشخیص ناهنجاری
#         anomaly_model_path = "isolation_forest_model.onnx"
        
#         # ایجاد شیء AnomalyDetector
#         detector = AnomalyDetector(db_config, anomaly_model_path)
        
#         # تشخیص ناهنجاری
#         result = detector.detect_anomalies(threshold=0.5)
        
#         return jsonify({"status": result}), 200
#     except Exception as e:
#         return jsonify({"error": f"Anomaly detection failed: {str(e)}"}), 500


# if __name__ == '__main__':
#     app.run(debug=True, port=5000, host='0.0.0.0')


import mysql.connector
from mysql.connector import Error
import pandas as pd
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': 'sql102.infinityfree.com',
    'user': 'if0_38611183',
    'password': 'tOfY6fMAcbXIcFw',
    'database': 'if0_38611183_XXX',
    'port': 3306
}

def create_database_connection():
    """Create a database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            print("Successfully connected to MySQL database")
            return connection
    except Error as e:
        print(f"Error connecting to MySQL database: {e}")
        return None

def create_tables(connection):
    """Create necessary tables if they don't exist"""
    try:
        cursor = connection.cursor()
        
        # Create compressor_data table
        create_table_query = """
        CREATE TABLE IF NOT EXISTS compressor_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            timestamp DATETIME,
            pressure_in FLOAT,
            temperature_in FLOAT,
            flow_rate FLOAT,
            pressure_out FLOAT,
            temperature_out FLOAT,
            efficiency FLOAT,
            power_consumption FLOAT,
            vibration FLOAT,
            status VARCHAR(20),
            frequency FLOAT,
            amplitude FLOAT,
            phase_angle FLOAT,
            mass FLOAT,
            stiffness FLOAT,
            damping FLOAT,
            density FLOAT,
            velocity FLOAT,
            viscosity FLOAT
        )
        """
        cursor.execute(create_table_query)
        connection.commit()
        print("Tables created successfully")
    except Error as e:
        print(f"Error creating tables: {e}")

def insert_data(connection, data):
    """Insert data into the compressor_data table"""
    try:
        cursor = connection.cursor()
        
        insert_query = """
        INSERT INTO compressor_data (
            timestamp, pressure_in, temperature_in, flow_rate, pressure_out,
            temperature_out, efficiency, power_consumption, vibration, status,
            frequency, amplitude, phase_angle, mass, stiffness, damping,
            density, velocity, viscosity
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # Convert DataFrame to list of tuples for insertion
        values = data.values.tolist()
        cursor.executemany(insert_query, values)
        connection.commit()
        print(f"Successfully inserted {len(values)} records")
    except Error as e:
        print(f"Error inserting data: {e}")

def get_latest_data(connection, limit=100):
    """Retrieve the latest data from the database"""
    try:
        query = """
        SELECT * FROM compressor_data 
        ORDER BY timestamp DESC 
        LIMIT %s
        """
        df = pd.read_sql(query, connection, params=(limit,))
        return df
    except Error as e:
        print(f"Error retrieving data: {e}")
        return None

def main():
    # Create database connection
    connection = create_database_connection()
    
    if connection:
        try:
            # Create tables
            create_tables(connection)
            
            # Read the CSV file
            df = pd.read_csv("balanced_compressor_time_series_data.csv")
            
            # Insert data into database
            insert_data(connection, df)
            
            # Retrieve and display latest data
            latest_data = get_latest_data(connection)
            if latest_data is not None:
                print("\nLatest data from database:")
                print(latest_data.head())
                
        except Error as e:
            print(f"Error in main execution: {e}")
        finally:
            if connection.is_connected():
                connection.close()
                print("Database connection closed")

if __name__ == "__main__":
    main()