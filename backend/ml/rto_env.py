# backend/ml/rto_env.py (Final Corrected Version)

import numpy as np
import pandas as pd
import gymnasium as gym
from gymnasium import spaces
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from typing import Dict, Optional


class CompressorEnv(gym.Env):
    def __init__(
        self,
        df: pd.DataFrame,
        scaler: Optional[StandardScaler] = None,
        reward_weights: Optional[Dict[str, float]] = None,
        dynamics_models: Optional[Dict[str, LinearRegression]] = None,
    ):
        super(CompressorEnv, self).__init__()
        self.df = df.reset_index(drop=True)
        self.scaler = scaler

        if reward_weights is None:
            self.reward_weights = {"efficiency": 1.0, "power": 1.0, "vibration": 0.5}
        else:
            self.reward_weights = reward_weights

        self.state_features = [
            "Pressure_In",
            "Temperature_In",
            "Flow_Rate",
            "Pressure_Out",
            "Temperature_Out",
            "Efficiency",
            "Power_Consumption",
            "Vibration",
            "Ambient_Temperature",
            "Humidity",
            "Air_Pollution",
            "Fuel_Quality",
            "Load_Factor",
            "vib_std",
            "vib_max",
            "vib_mean",
            "vib_min",
            "vib_rms",
            "Velocity",
            "Viscosity",
            "Phase_Angle",
        ]
        self.output_features = ["Efficiency", "Power_Consumption", "Vibration"]

        self.norm_ranges = {
            "efficiency_min": df["Efficiency"].min(),
            "efficiency_max": df["Efficiency"].max(),
            "power_min": df["Power_Consumption"].min(),
            "power_max": df["Power_Consumption"].max(),
            "vibration_min": df["Vibration"].min(),
            "vibration_max": df["Vibration"].max(),
        }

        self.action_space = spaces.Box(low=0.0, high=1.0, shape=(1,), dtype=np.float32)
        self.observation_space = spaces.Box(
            low=-np.inf,
            high=np.inf,
            shape=(len(self.state_features),),
            dtype=np.float32,
        )

        if dynamics_models:
            self.models = dynamics_models
        else:
            self.models = self._train_models()

        self.current_step = 0
        self.state, _ = self.reset()

    @property
    def dynamics_models(self) -> Dict[str, LinearRegression]:
        """A property to easily access the trained dynamics models."""
        return self.models

    def _train_models(self) -> Dict[str, LinearRegression]:
        """Trains simple linear models to predict KPIs based on the load factor."""
        models = {}
        X = self.df[["Load_Factor"]]
        for target in self.output_features:
            y = self.df[target]
            models[target] = LinearRegression().fit(X, y)
        return models

    def _get_state(self, step: int) -> np.ndarray:
        """Retrieves and optionally normalizes the state for a given step."""
        state_df = self.df.loc[[step], self.state_features]
        if self.scaler:
            scaled_state = self.scaler.transform(state_df)
            return scaled_state.flatten().astype(np.float32)
        return state_df.values.flatten().astype(np.float32)

    def reset(self, seed: Optional[int] = None, options: Optional[dict] = None):
        super().reset(seed=seed)
        self.current_step = 0
        initial_state = self._get_state(self.current_step)
        return initial_state, {}

    def _normalize(self, value, min_val, max_val):
        """Helper function for Min-Max normalization."""
        if (max_val - min_val) == 0:
            return 0
        return (value - min_val) / (max_val - min_val)

    def step(self, action: np.ndarray):
        load_factor = np.clip(action, 0.0, 1.0)[0]
        load_factor_df = pd.DataFrame([[load_factor]], columns=["Load_Factor"])

        efficiency = self.models["Efficiency"].predict(load_factor_df)[0]
        power = self.models["Power_Consumption"].predict(load_factor_df)[0]
        vibration = self.models["Vibration"].predict(load_factor_df)[0]

        norm_efficiency = self._normalize(
            efficiency,
            self.norm_ranges["efficiency_min"],
            self.norm_ranges["efficiency_max"],
        )
        norm_power = 1 - self._normalize(
            power, self.norm_ranges["power_min"], self.norm_ranges["power_max"]
        )
        norm_vibration = 1 - self._normalize(
            vibration,
            self.norm_ranges["vibration_min"],
            self.norm_ranges["vibration_max"],
        )

        reward = (
            self.reward_weights["efficiency"] * norm_efficiency
            + self.reward_weights["power"] * norm_power
            + self.reward_weights["vibration"] * norm_vibration
        )

        self.current_step += 1
        done = self.current_step >= len(self.df) - 1

        next_state = (
            self._get_state(self.current_step)
            if not done
            else np.zeros(self.observation_space.shape, dtype=np.float32)
        )
        info = {"efficiency": efficiency, "power": power, "vibration": vibration}

        return next_state, reward, done, False, info
