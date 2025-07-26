import numpy as np
import gym
from gym import spaces

class CompressorEnv(gym.Env):
    def __init__(self, df):
        super(CompressorEnv, self).__init__()
        self.df = df.reset_index(drop=True)
        self.current_step = 0
        self.state_features = [
            'Pressure_In', 'Temperature_In', 'Flow_Rate', 'Pressure_Out', 'Temperature_Out',
            'Efficiency', 'Power_Consumption', 'Vibration', 'Ambient_Temperature',
            'Humidity', 'Air_Pollution', 'Fuel_Quality', 'Load_Factor',
            'vib_std', 'vib_max', 'vib_mean', 'vib_min', 'vib_rms',
            'Velocity', 'Viscosity', 'Phase_Angle'
        ]
        self.action_space = spaces.Box(low=0.0, high=1.0, shape=(1,), dtype=np.float32)
        self.observation_space = spaces.Box(
            low=0.0, high=1.0, shape=(len(self.state_features),), dtype=np.float32
        )
        self.state = self._get_state(self.current_step)

    def _get_state(self, step):
        return self.df.loc[step, self.state_features].values.astype(np.float32)

    def reset(self):
        self.current_step = 0
        self.state = self._get_state(self.current_step)
        return self.state

    def step(self, action):
        action = np.clip(action, 0.0, 1.0)
        self.df.loc[self.current_step, 'Load_Factor'] = action[0]

        # Get state BEFORE next step for reward
        current_data = self.df.loc[self.current_step]
        vibration = current_data['Vibration']
        efficiency = current_data['Efficiency']
        power = current_data['Power_Consumption']
        reward = efficiency - 0.1 * vibration - 0.01 * power

        self.current_step += 1
        done = self.current_step >= len(self.df)
        if not done:
            self.state = self._get_state(self.current_step)
        else:
            self.state = np.zeros_like(self.state)

        return self.state, reward, done, {
            'efficiency': efficiency,
            'vibration': vibration,
            'power': power,
            'step': self.current_step
        }

    def render(self, mode='human'):
        data = self.df.loc[self.current_step]
        print(f"Step {self.current_step}: Load_Factor={data['Load_Factor']:.2f}")
