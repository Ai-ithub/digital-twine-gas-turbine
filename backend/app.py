import mysql.connector
from mysql.connector import Error
import pandas as pd
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'new_user',
    'password': 'new_password123',
    'database': 'compressor_db',
    'auth_plugin': 'mysql_native_password',
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
        
        # Create compressor_data table without Timestamp
        create_table_query = """
        CREATE TABLE IF NOT EXISTS compressor_data (
            id INT PRIMARY KEY AUTO_INCREMENT,
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
            ambient_temperature FLOAT,
            humidity FLOAT,
            air_pollution FLOAT,
            startup_shutdown_cycles FLOAT,
            maintenance_quality FLOAT,
            fuel_quality FLOAT,
            load_factor FLOAT
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
            timestamp, pressure_in, temperature_in, flow_rate, 
            pressure_out, temperature_out, efficiency, air_pollution, power_consumption, 
            vibration, status, ambient_temperature, humidity, 
            startup_shutdown_cycles, maintenance_quality, fuel_quality, load_factor
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # Remove the 'Time' column from the DataFrame
        data = data.drop(columns=["Time", 'Anomaly_Score', 'Anomaly_Autoencoder', 'Anomaly_DBSCAN',
                                  'Final_Anomaly', 'Anomaly_LOF', 'Anomaly_IForest'])
        #data["Timestamp"] = pd.to_datetime(data["Timestamp"])
        # Check that the DataFrame has the expected columns (17 columns)
        print("DataFrame columns after removing Time:", data.columns)

        # Convert DataFrame to list of tuples for insertion (17 columns)
        values = data[['Timestamp', 'Pressure_In', 'Temperature_In', 'Flow_Rate', 'Pressure_Out', 
                       'Temperature_Out', 'Efficiency', 'Air_Pollution','Power_Consumption', 'Vibration', 'Status', 
                       'Ambient_Temperature', 'Humidity', 'Startup_Shutdown_Cycles', 'Maintenance_Quality', 'Fuel_Quality', 
                       'Load_Factor']].values.tolist()
        
        # Print the values being inserted to ensure they match
        print("Values to insert:", values[0])  # Print only the first 5 rows for brevity
        print(data["Ambient_Temperature"].head())

        cursor.executemany(insert_query, values)
        connection.commit()
        print(f"Successfully inserted {len(values)} records")
    except Error as e:
        print(f"Error inserting data: {e}")

def get_latest_data(connection, limit=100):
    """Retrieve the latest data from the database"""
    try:
        cursor = connection.cursor(dictionary=True)  # Using dictionary to get results in a readable form
        query = """
        SELECT * FROM compressor_data 
        ORDER BY id DESC 
        LIMIT %s
        """
        cursor.execute(query, (limit,))
        result = cursor.fetchall()
        df = pd.DataFrame(result)
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
            
            # Read the CSV file (without the Timestamp column)
            df = pd.read_csv("final_optimized_anomaly_detected_data.csv")  # Assuming Timestamp column is not in the CSV
            
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
