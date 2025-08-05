import onnxruntime as ort
import numpy as np
from sklearn.preprocessing import StandardScaler
from database import CompressorDatabase  # Import the class for fetching the data

class ONNXPredictor:
    def __init__(self, onnx_model_path: str, db_host: str, db_user: str, db_password: str, db_name: str, db_table: str):
        """
        Constructor for the class: loads the ONNX model.
        
        :param onnx_model_path: Path to the ONNX model file
        :param db_host: Database host
        :param db_user: Database user
        :param db_password: Database password
        :param db_name: Database name
        :param db_table: Table name in the database
        """
        # Load the ONNX model
        self.session = ort.InferenceSession(onnx_model_path)
        self.input_name = self.session.get_inputs()[0].name
        
        # Check expected model input shape
        self.model_input_shape = self.session.get_inputs()[0].shape
        self.num_features = self.model_input_shape[1]  # Number of features expected by the model
        
        # Database connection details
        self.db_host = db_host
        self.db_user = db_user
        self.db_password = db_password
        self.db_name = db_name
        self.db_table = db_table
        
        # Create a scaler for data preprocessing
        self.scaler = StandardScaler()

    def load_and_preprocess_data(self) -> np.ndarray:
        """
        Read and preprocess data from the database, extracting the required features for the model.
        
        :return: Preprocessed data (scaled)
        """
        # Connect to the database and fetch data
        db = CompressorDatabase(host=self.db_host, user=self.db_user, password=self.db_password, 
                                database=self.db_name, table=self.db_table)
        
        if not db.connect():
            raise Exception("Failed to connect to the database")
        
        # Load the data from the database
        if not db.load_data():
            raise Exception("Failed to load data from the database")
        
        # Assuming 'Vibration' is the main feature. Here, you can adjust if other features are needed.
        vibration_data = [record['vibration'] for record in db._data]
        
        # If no vibration data is found, raise an error
        if not vibration_data:
            raise Exception("No vibration data found.")
        
        # Standardize the vibration data
        vibration_data_scaled = self.scaler.fit_transform(np.array(vibration_data).reshape(-1, 1))
        
        # Assuming we need 5 features, we create a feature vector with other dummy or real data
        # For now, using zeros for missing data (replace with actual data if available)
        other_features = np.zeros((len(vibration_data_scaled), self.num_features - 1))  # Adjust to have the required number of features
        
        # Combine vibration data with other features (fill other columns with zero or real values)
        input_data = np.hstack([vibration_data_scaled, other_features])
        
        # Ensure data type is float32 as required by ONNX
        input_data = input_data.astype(np.float32)
        
        return input_data

    def predict_all_values(self) -> np.ndarray:
        """
        Predict the next value for each vibration entry from the database.
        
        :return: List of predicted values for each vibration data point
        """
        # Load and preprocess data
        input_data = self.load_and_preprocess_data()
        
        predictions = []
        
        # Loop through each data point and predict the next value
        for i in range(len(input_data)):
            # Use the current data point for prediction
            current_input = input_data[i].reshape(1, -1)
            
            # Perform the prediction using the ONNX model
            prediction = self.session.run(None, {self.input_name: current_input})
            
            # Append the prediction to the list
            predictions.append(prediction[0][0])
        
        return predictions

# Example usage of the class
if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    load_dotenv() # Load variables from .env file

    onnx_model_path = "backend/dart_model.onnx"

    # Database configuration loaded from environment variables
    db_host = os.getenv("DB_HOST")
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_name = os.getenv("DB_DATABASE")
    db_table = "compressor_data"
    
    # Create a predictor object
    predictor = ONNXPredictor(onnx_model_path, db_host, db_user, db_password, db_name, db_table)
    
    # Predict the next vibration value for each entry in the dataset
    predicted_values = predictor.predict_all_values()
    
    # Print the predicted values
    for idx, predicted_value in enumerate(predicted_values):
        print(f"Predicted Next Vibration Value for Entry {idx + 1}: {predicted_value}")
