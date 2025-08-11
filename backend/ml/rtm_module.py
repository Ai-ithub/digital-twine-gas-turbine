import onnxruntime as ort
import numpy as np
import pandas as pd

class AnomalyDetector:
    """
    A class to detect anomalies in sensor data using a pre-trained Isolation Forest model.
    """
    def __init__(self, model_path="backend/isolation_forest_model.onnx"):
        """
        Initializes the detector by loading the pre-trained ONNX model.
        """
        self.model_path = model_path
        self.session = None
        # CORRECTED: List of 16 features the model likely expects
        self.features = [
            'Pressure_In', 'Temperature_In', 'Flow_Rate', 'Pressure_Out',
            'Temperature_Out', 'Efficiency', 'Power_Consumption', 'Vibration',
            'Ambient_Temperature', 'Humidity', 'Air_Pollution', 'Frequency',
            'Amplitude', 'Phase_Angle', 'Velocity', 'Stiffness'
        ]
        self.load_model()

    def load_model(self):
        """Loads the anomaly detection model from the specified path."""
        try:
            self.session = ort.InferenceSession(self.model_path)
            print(f"✅ Anomaly detection model loaded successfully from {self.model_path}")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
    
    def predict(self, data_row: dict):
        """
        Predicts if a single row of data (as a dictionary) is an anomaly.
        Returns -1 for an anomaly and 1 for a normal point.
        """
        if not self.session:
            print("❌ Model is not loaded. Cannot predict.")
            return None
        
        try:
            df_point = pd.DataFrame([data_row])
            input_data = df_point[self.features].values.astype(np.float32)

            input_name = self.session.get_inputs()[0].name
            prediction = self.session.run(None, {input_name: input_data})[0][0]
            
            return int(prediction)

        except KeyError:
             print("❌ Error during prediction: One or more required features are missing from the input data.")
             return None
        except Exception as e:
            print(f"❌ Error during prediction: {e}")
            return None

# This block is for testing the class directly
if __name__ == '__main__':
    detector = AnomalyDetector()
    
    if detector.session:
        # CORRECTED: Sample data now includes all 16 features
        sample_data = {
            'Pressure_In': 3.5, 'Temperature_In': 25.0, 'Flow_Rate': 12.0, 'Pressure_Out': 18.0,
            'Temperature_Out': 200.0, 'Efficiency': 0.82, 'Power_Consumption': 5800, 'Vibration': 1.5,
            'Ambient_Temperature': 26.0, 'Humidity': 50.0, 'Air_Pollution': 0.05, 'Frequency': 50.0,
            'Amplitude': 1.2, 'Phase_Angle': 0.6, 'Velocity': 3.4, 'Stiffness': 500000.0
        }
        
        prediction = detector.predict(sample_data)
        
        if prediction is not None:
            print("\n--- Test Prediction ---")
            print(f"Input feature count: {len(sample_data)}")
            print(f"Output: {prediction} ({'Anomaly' if prediction == -1 else 'Normal'})")