import os
import numpy as np
import onnxruntime as ort
from dotenv import load_dotenv
from typing import Dict
import logging

# CORRECTED: Use an absolute import from the 'backend' package root
from backend.core.database import CompressorDatabase

class ONNXPredictor:
    """A generic class to run predictions using an ONNX model and data from the database."""
    
    # CHANGED: __init__ now accepts a single db_config dictionary
    def __init__(self, onnx_model_path: str, db_config: Dict):
        """
        Args:
            onnx_model_path (str): The full path to the ONNX model file.
            db_config (Dict): A dictionary containing database connection details.
        """
        self.logger = logging.getLogger("ONNXPredictor")
        
        # Load the ONNX model
        try:
            self.session = ort.InferenceSession(onnx_model_path)
            self.input_name = self.session.get_inputs()[0].name
            self.logger.info(f"Model loaded successfully from {onnx_model_path}")
        except Exception as e:
            self.logger.error(f"Error loading ONNX model from {onnx_model_path}: {e}")
            raise

        # CHANGED: Use the db_config dictionary to initialize the database connection
        if not db_config:
            raise ValueError("db_config is required for ONNXPredictor.")
        self.db = CompressorDatabase(**db_config)
        
        self.scaler = None # This class might need a scaler in the future

    def predict_all_values(self) -> np.ndarray:
        """
        Loads data from the database, preprocesses it, and runs prediction for all entries.
        
        Returns:
            np.ndarray: A numpy array of predicted values.
        """
        # Connect to the database and fetch data
        if not self.db.connect():
            raise ConnectionError("Failed to connect to the database")
        
        if not self.db.load_data(): # This loads the first 100 records by default
            raise ValueError("Failed to load data from the database")
        
        # This part of the logic is a placeholder and needs to be adapted to your DART model's specific inputs.
        # For now, it assumes the model needs 'Vibration' data.
        try:
            # Assuming 'Vibration' is the main feature. Adjust if other features are needed.
            data_points = [record['Vibration'] for record in self.db._data]
            if not data_points:
                return np.array([]) # Return empty array if no data
        except KeyError:
            self.logger.error("'Vibration' column not found in data for DART prediction.")
            return np.array([])

        input_data = np.array(data_points).astype(np.float32).reshape(-1, 1)

        # The prediction logic should be adapted based on the actual model's requirements
        # For now, this is a simplified loop.
        predictions = self.session.run(None, {self.input_name: input_data})[0]
        
        return predictions.flatten()


if __name__ == '__main__':
    # This block allows for direct testing of the script
    load_dotenv()
    
    db_config = {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", 3306)),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD"),
        "database": os.getenv("DB_DATABASE", "compressor_db"),
        "table": "compressor_data"
    }
    
    # Use the correct path from the .env file or the default
    model_path = os.getenv("DART_MODEL_PATH", "artifacts/dart_model.onnx")

    if not all([db_config.get("password"), os.path.exists(model_path)]):
        print("Database password not found in .env or model file does not exist. Exiting.")
        exit(1)
        
    try:
        predictor = ONNXPredictor(model_path, db_config)
        predicted_values = predictor.predict_all_values()
        
        print(f"Generated {len(predicted_values)} predictions.")
        for idx, value in enumerate(predicted_values[:10]): # Print first 10
            print(f"Prediction for Entry {idx + 1}: {value:.4f}")
            
    except Exception as e:
        print(f"An error occurred: {e}")
    
    finally:
        if 'predictor' in locals() and predictor.db:
            predictor.db.close()