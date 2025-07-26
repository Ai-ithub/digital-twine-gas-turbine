import numpy as np
import gym
from gym import spaces
import pandas as pd

class CompressorEnv(gym.Env):
    def __init__(self, df):
        super(CompressorEnv, self).__init__()

        self.df = df.reset_index(drop=True)
        self.current_step = 0

        # Action space: controlling Load_Factor between 0 and 1
        self.action_space = spaces.Box(low=0.0, high=1.0, shape=(1,), dtype=np.float32)

        # Numerical columns used in the environment state
        self.state_features = [
            'Pressure_In', 'Temperature_In', 'Flow_Rate', 'Pressure_Out', 'Temperature_Out',
            'Efficiency', 'Power_Consumption', 'Vibration', 'Ambient_Temperature',
            'Humidity', 'Air_Pollution', 'Fuel_Quality', 'Load_Factor',
            'vib_std', 'vib_max', 'vib_mean', 'vib_min', 'vib_rms',
            'Velocity', 'Viscosity', 'Phase_Angle'
        ]

        # Observation space based on the number of state features
        self.observation_space = spaces.Box(
            low=0.0, high=1.0, shape=(len(self.state_features),), dtype=np.float32
        )

        self.state = self._get_state(self.current_step)

    def _get_state(self, step):
        # Retrieve the state for the current step (normalized numerical values)
        return self.df.loc[step, self.state_features].values.astype(np.float32)

    def reset(self):
        # Reset the environment to the initial state
        self.current_step = 0
        self.state = self._get_state(self.current_step)
        return self.state

    def step(self, action):
        # Clip the action to stay within the valid range [0, 1]
        action = np.clip(action, 0.0, 1.0)

        # Apply the action to modify the Load_Factor
        self.df.loc[self.current_step, 'Load_Factor'] = action[0]

        # Move to the next step
        self.current_step += 1
        done = self.current_step >= len(self.df)
        
        if not done:
            self.state = self._get_state(self.current_step)
        else:
            self.state = np.zeros_like(self.state)  # یا نگه‌داشتن state قبلی


        # Get the new state
        self.state = self._get_state(self.current_step)

        # Define the reward function
        vibration = self.df.loc[self.current_step, 'Vibration']
        efficiency = self.df.loc[self.current_step, 'Efficiency']
        power = self.df.loc[self.current_step, 'Power_Consumption']

        # Reward prioritizes high efficiency, low vibration, and low power usage
        reward = efficiency - 0.1 * vibration - 0.01 * power

        return self.state, reward, done, {
            'efficiency': efficiency,
            'vibration': vibration,
            'power': power,
            'step': self.current_step
        }


    def render(self, mode='human'):
        if self.current_step % 50 == 0:
            print(f"Step {self.current_step}: Load_Factor={self.df.loc[self.current_step, 'Load_Factor']:.3f}, Efficiency={efficiency:.3f}, Vibration={vibration:.3f}, Power={power:.3f}")

