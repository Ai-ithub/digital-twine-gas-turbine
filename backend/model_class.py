import tensorflow as tf
import numpy as np

class ModelPredictor:
    def __init__(self, model_path):
        """
        Initialize the predictor by loading the saved TensorFlow model.

        Args:
            model_path (str): Path to the saved TensorFlow model.
        """
        # Load the saved TensorFlow model
        self.model = tf.saved_model.load(model_path)
        self.features = ['Pressure_In', 'Temperature_In', 'Flow_Rate', 'Pressure_Out',
                         'Temperature_Out', 'Efficiency', 'Power_Consumption', 'Vibration',
                         'Frequency', 'Amplitude', 'Phase_Angle', 'Mass', 'Stiffness',
                         'Damping', 'Density', 'Velocity', 'Viscosity']

    def predict(self, input_data):
        """
        Predict the output using the loaded TensorFlow model.

        Args:
            input_data (dict): A dictionary containing feature names as keys and their values.

        Returns:
            float: The predicted value.
        """
        # Validate input data
        if not isinstance(input_data, dict):
            raise ValueError("Input data must be a dictionary with feature names as keys.")
        
        # Ensure all required features are provided
        missing_features = [feature for feature in self.features if feature not in input_data]
        if missing_features:
            raise ValueError(f"Missing features in input data: {missing_features}")
        
        # Convert input data to a numpy array in the correct order
        input_array = np.array([input_data[feature] for feature in self.features], dtype=np.float32)
        
        # Reshape the input array to match the model's expected input shape
        input_array = input_array.reshape(1, -1)  # Shape: (1, num_features)

        # Perform prediction
        predictions = self.model.signatures["serving_default"](tf.constant(input_array))
        
        # Extract the predicted value (assuming the model outputs a single value)
        predicted_value = predictions[list(predictions.keys())[0]].numpy()[0][0]
        
        return predicted_value