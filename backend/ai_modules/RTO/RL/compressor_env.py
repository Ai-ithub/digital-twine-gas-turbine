import numpy as np
import pandas as pd
import gymnasium as gym
from gymnasium import spaces
from sklearn.linear_model import LinearRegression

class CompressorEnv(gym.Env):
    """
    Custom Gym environment that simulates a compressor system.
    Output variables are dynamically modeled using simple linear regression based on Load_Factor.
    """
    def __init__(self, df):
        super(CompressorEnv, self).__init__()
        self.df = df.reset_index(drop=True)

        # Define input and output features
        self.state_features = [
            'Pressure_In', 'Temperature_In', 'Flow_Rate', 'Pressure_Out', 'Temperature_Out',
            'Efficiency', 'Power_Consumption', 'Vibration', 'Ambient_Temperature',
            'Humidity', 'Air_Pollution', 'Fuel_Quality', 'Load_Factor',
            'vib_std', 'vib_max', 'vib_mean', 'vib_min', 'vib_rms',
            'Velocity', 'Viscosity', 'Phase_Angle'
        ]
        self.output_features = ['Efficiency', 'Power_Consumption', 'Vibration']

        # Define action and observation spaces
        self.action_space = spaces.Box(low=0.0, high=1.0, shape=(1,), dtype=np.float32)
        self.observation_space = spaces.Box(low=0.0, high=1.0, shape=(len(self.state_features),), dtype=np.float32)

        self.current_step = 0
        self.state = self._get_state(self.current_step)

        # Train regression models for output prediction
        self.models = self._train_models()

    def _train_models(self):
        models = {}
        X = self.df[['Load_Factor']]
        for target in self.output_features:
            y = self.df[target]
            models[target] = LinearRegression().fit(X, y)
        return models

    def _get_state(self, step):
        return self.df.loc[step, self.state_features].values.astype(np.float32)

    def reset(self):
        self.current_step = 0
        self.state = self._get_state(self.current_step)
        return self.state

    def step(self, action):
        action = np.clip(action, 0.0, 1.0)
        load_factor_df = pd.DataFrame([[action[0]]], columns=['Load_Factor'])

        # Predict output variables using linear models
        efficiency = self.models['Efficiency'].predict(load_factor_df)[0]
        power = self.models['Power_Consumption'].predict(load_factor_df)[0]
        vibration = self.models['Vibration'].predict(load_factor_df)[0]

        # Compute reward based on efficiency, power, and vibration
        reward = 1.5 * efficiency - 0.01 * power - 0.1 * vibration

        # Advance to the next step
        self.current_step += 1
        done = self.current_step >= len(self.df)
        self.state = self._get_state(self.current_step) if not done else np.zeros_like(self.state)

        return self.state, reward, done, {
            'efficiency': efficiency,
            'power': power,
            'vibration': vibration,
            'load_factor': action[0]
        }

    def render(self, mode='human'):
        print(f"Step {self.current_step}: State = {self.state}")
