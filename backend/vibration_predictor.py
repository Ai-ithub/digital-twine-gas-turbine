import os
import numpy as np
import onnxruntime as ort
from database import CompressorDatabase
from typing import Dict, List, Optional
import logging
from dotenv import load_dotenv

# NEW: Get the absolute path to the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

class VibrationPredictor:
    """
    A class for predicting vibrations using a pre-trained ONNX Transformer model.
    It handles data fetching, preprocessing with a saved scaler, and prediction.
    """
    
    # CHANGED: __init__ now requires db_config and uses absolute paths for models.
    def __init__(self,
                 db_config: Dict,
                 model_filename: str = "farid_kaki_vibration_transformer.onnx",
                 scaler_mean_filename: str = "scaler_mean.npy",
                 scaler_scale_filename: str = "scaler_scale.npy",
                 window_size: int = 60):
        
        if not db_config:
            raise ValueError("db_config is required for VibrationPredictor.")

        self.db = CompressorDatabase(**db_config)
        self.window_size = window_size
        self.data_window = []
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("VibrationPredictor")

        # --- THE FIX for File Not Found Error ---
        # Build absolute paths to the model and scaler files
        model_path = os.path.join(SCRIPT_DIR, model_filename)
        scaler_mean_path = os.path.join(SCRIPT_DIR, scaler_mean_filename)
        scaler_scale_path = os.path.join(SCRIPT_DIR, scaler_scale_filename)
        
        # Load the model using the absolute path
        try:
            self.model = ort.InferenceSession(model_path)
            self.logger.info(f"Model loaded successfully from {model_path}")
        except Exception as e:
            self.logger.error(f"Error loading model from {model_path}: {e}")
            raise

        # Load scaler parameters using absolute paths
        try:
            self.scaler_mean = np.load(scaler_mean_path)
            self.scaler_scale = np.load(scaler_scale_path)
            self.logger.info("Normalization parameters loaded successfully.")
        except FileNotFoundError as e:
            self.logger.error(f"Could not find scaler files: {e}")
            raise

    def initialize(self) -> bool:
        """Initializes the system by connecting to the DB and filling the initial data window."""
        if not self.db.connect():
            return False
        if not self.db.load_data(): # This assumes load_data gets enough data
            return False
        self._fill_initial_window()
        return True

    def _fill_initial_window(self) -> None:
        """Fills the initial time window with historical data from the database."""
        self.logger.info("Filling initial data window...")
        # ... (بقیه متد بدون تغییر)
        while len(self.data_window) < self.window_size:
            record = self.db.get_next_record()
            if not record:
                break
            self._process_record(record)
        
        if len(self.data_window) < self.window_size:
            self.logger.warning(
                f"Insufficient historical data. Needed: {self.window_size}, available: {len(self.data_window)}"
            )

    def _process_record(self, record: Dict) -> None:
        """Processes and normalizes a single record."""
        # ... (بقیه متد بدون تغییر)
        try:
            features = np.array([
                record['Pressure_In'], record['Temperature_In'], record['Flow_Rate'],
                record['Pressure_Out'], record['Temperature_Out'], record['Efficiency']
            ], dtype=np.float32)
            
            normalized = (features - self.scaler_mean) / self.scaler_scale
            self.data_window.append(normalized)
            if len(self.data_window) > self.window_size * 2: # Prevent memory leak
                self.data_window.pop(0)

        except KeyError as e:
            self.logger.error(f"Required field {e} not found in the record.")


    def predict_all(self) -> List[Dict]:
        """Performs predictions for all available records in the database."""
        # ... (بقیه متد بدون تغییر)
        predictions = []
        while True:
            record = self.db.get_next_record()
            if not record:
                break
            self._process_record(record)
            if len(self.data_window) >= self.window_size:
                input_data = np.array(
                    self.data_window[-self.window_size:], dtype=np.float32
                ).reshape(1, self.window_size, -1)

                prediction = self.model.run(
                    None, {self.model.get_inputs()[0].name: input_data}
                )[0][0][0]

                final_prediction = prediction # Assuming the model output is already denormalized or target is scaled vibration
                
                predictions.append({
                    "timestamp": record.get('Time'),
                    "predicted_vibration": float(final_prediction)
                })
        
        return predictions

# Example usage of the class
if __name__ == "__main__":
    load_dotenv() # Load .env file for local testing
    
    # CHANGED: Read DB config from environment variables
    db_config = {
        "host": os.getenv("DB_HOST", "localhost"),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD"),
        "database": os.getenv("DB_DATABASE", "compressor_db"),
        "table": "compressor_data"
    }

    if not db_config.get("password"):
        print("Database password not found in .env file. Exiting.")
        exit(1)
        
    try:
        predictor = VibrationPredictor(db_config=db_config)
        
        if not predictor.initialize():
            print("Error initializing the system!")
            exit(1)
        
        results = predictor.predict_all()
        
        print(f"Generated {len(results)} predictions.")
        for res in results[:10]: # Print first 10 predictions
            print(f"Time: {res['timestamp']} | Predicted Vibration: {res['predicted_vibration']:.4f}")
            
    except Exception as e:
        print(f"An error occurred during execution: {e}")
    
    finally:
        if 'predictor' in locals() and predictor.db:
            predictor.db.close()