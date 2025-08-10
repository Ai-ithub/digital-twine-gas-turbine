import numpy as np
import pandas as pd
import gymnasium as gym
from gymnasium import spaces
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Optional

class CompressorEnv(gym.Env):
    """
    Custom Gym environment for a compressor system, built from a historical dataset.
    It supports state normalization, a configurable reward function, and accepts pre-trained
    dynamics models to prevent data leakage between train and test sets.
    """
    def __init__(self,
                 df: pd.DataFrame,
                 scaler: Optional[StandardScaler] = None,
                 reward_weights: Optional[Dict[str, float]] = None,
                 dynamics_models: Optional[Dict[str, LinearRegression]] = None):
        """
        Args:
            df (pd.DataFrame): The dataset for the simulation.
            scaler (Optional[StandardScaler]): A pre-fitted StandardScaler for state normalization.
            reward_weights (Optional[Dict[str, float]]): Weights for the reward function.
            dynamics_models (Optional[Dict[str, LinearRegression]]): Pre-trained models for environment dynamics.
                                                                     If None, models will be trained on the provided df.
        """
        super(CompressorEnv, self).__init__()
        self.df = df.reset_index(drop=True)
        self.scaler = scaler

        if reward_weights is None:
            self.reward_weights = {'efficiency': 1.5, 'power': -0.01, 'vibration': -0.1}
        else:
            self.reward_weights = reward_weights

        self.state_features = [
            'Pressure_In', 'Temperature_In', 'Flow_Rate', 'Pressure_Out', 'Temperature_Out',
            'Efficiency', 'Power_Consumption', 'Vibration', 'Ambient_Temperature',
            'Humidity', 'Air_Pollution', 'Fuel_Quality', 'Load_Factor',
            'vib_std', 'vib_max', 'vib_mean', 'vib_min', 'vib_rms',
            'Velocity', 'Viscosity', 'Phase_Angle'
        ]
        self.output_features = ['Efficiency', 'Power_Consumption', 'Vibration']

        self.action_space = spaces.Box(low=0.0, high=1.0, shape=(1,), dtype=np.float32)
        self.observation_space = spaces.Box(
            low=-np.inf, high=np.inf, shape=(len(self.state_features),), dtype=np.float32
        )

        # CHANGED: Use pre-trained models if provided, otherwise train them.
        if dynamics_models:
            self.models = dynamics_models
        else:
            self.models = self._train_models()
            
        self.current_step = 0
        self.state = self.reset()[0] # reset now returns a tuple

    @property
    def dynamics_models(self) -> Dict[str, LinearRegression]:
        """A property to easily access the trained dynamics models."""
        return self.models

    def _train_models(self) -> Dict[str, LinearRegression]:
        """Trains simple linear models to predict KPIs based on the load factor."""
        models = {}
        X = self.df[['Load_Factor']]
        for target in self.output_features:
            y = self.df[target]
            models[target] = LinearRegression().fit(X, y)
        return models

    def _get_state(self, step: int) -> np.ndarray:
        """Retrieves and optionally normalizes the state for a given step."""
        state_values = self.df.loc[step, self.state_features].values.astype(np.float32)
        if self.scaler:
            return self.scaler.transform(state_values.reshape(1, -1)).flatten()
        return state_values

    def reset(self, seed: Optional[int] = None, options: Optional[dict] = None):
        """Resets the environment to the initial state."""
        super().reset(seed=seed)
        self.current_step = 0
        initial_state = self._get_state(self.current_step)
        return initial_state, {}

    def step(self, action: np.ndarray):
        """Executes one time step within the environment."""
        load_factor = np.clip(action, 0.0, 1.0)[0]
        load_factor_df = pd.DataFrame([[load_factor]], columns=['Load_Factor'])

        efficiency = self.models['Efficiency'].predict(load_factor_df)[0]
        power = self.models['Power_Consumption'].predict(load_factor_df)[0]
        vibration = self.models['Vibration'].predict(load_factor_df)[0]

        reward = (self.reward_weights['efficiency'] * efficiency +
                  self.reward_weights['power'] * power +
                  self.reward_weights['vibration'] * vibration)

        self.current_step += 1
        done = self.current_step >= len(self.df) - 1
        
        next_state = self._get_state(self.current_step) if not done else np.zeros(self.observation_space.shape, dtype=np.float32)
        
        terminated = done
        truncated = False
        
        info = {
            'efficiency': efficiency, 'power': power, 'vibration': vibration,
            'load_factor': load_factor
        }

        return next_state, reward, terminated, truncated, info

    def render(self, mode='human'):
        print(f"Step: {self.current_step}, Load Factor: {self.df.loc[self.current_step, 'Load_Factor']:.2f}")