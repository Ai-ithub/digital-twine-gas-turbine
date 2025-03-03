import onnxruntime as ort
import numpy as np
from database import CompressorDatabase  # Import the Database class from database.py

class CompressorStatusPredictor:
    def __init__(self, model_path: str, db_path: str):
        """
        Initialize the predictor by loading the ONNX model and database.
        :param model_path: Path to the main ONNX model
        :param db_path: Path to the SQLite database file
        """
        # Load the main model
        self.model_session = ort.InferenceSession(model_path)
        self.input_name = self.model_session.get_inputs()[0].name
        self.output_name = self.model_session.get_outputs()[0].name

        # Initialize the database
        self.database = Database(db_path)

    def preprocess_input(self, features: dict):
        """
        Preprocess the input data by converting it to a NumPy array.
        :param features: Dictionary of input features
        :return: Processed input data as a NumPy array
        """
        feature_list = ["Vibration", "Power_Consumption", "Efficiency",
                        "Ambient_Temperature", "Humidity", "Air_Pollution",
                        "Maintenance_Quality", "Fuel_Quality", "Load_Factor"]

        if not all(f in features for f in feature_list):
            raise ValueError("All required features are not provided!")

        # Convert features to a NumPy array
        input_data = np.array([features[f] for f in feature_list]).reshape(1, -1).astype(np.float32)
        return input_data

    def predict_from_db(self, record_id: int):
        """
        Predict the compressor status cluster using input data from the database.
        :param record_id: ID of the record to fetch from the database
        :return: Predicted cluster number
        """
        # Fetch input data from the database
        input_data = self.database.get_input_data(record_id)

        # Make a prediction
        processed_input = self.preprocess_input(input_data)
        result = self.model_session.run([self.output_name], {self.input_name: processed_input})[0]
        predicted_class = np.argmax(result, axis=1)[0]
        return int(predicted_class)

    def close_database(self):
        """
        Close the database connection.
        """
        self.database.close()