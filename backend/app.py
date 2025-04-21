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