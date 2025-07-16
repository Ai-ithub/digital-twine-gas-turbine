
import gym
import numpy as np
import random
from sensor_sim import generate_sensor_data

class CompressorEnv(gym.Env):

    def __init__(self):
        super().__init__()
        self.observation_space = gym.spaces.Box(low=0, high=200, shape=(4,), dtype=np.float32)
        self.action_space = gym.spaces.Box(low=-1.0, high=1.0, shape=(2,), dtype=np.float32)

        self.state = None

    def reset(self):
        self.state = np.array(generate_sensor_data(), dtype=np.float32)
        return self.state

    def step(self, action):
        pressure, temperature, flow_rate, vibration = self.state


        pressure += action[0] * 0.5
        flow_rate += action[1] * 1.0


        vibration = abs(random.normalvariate(0.5, 0.1))
        temperature += random.normalvariate(0, 0.2)

        self.state = np.array([pressure, temperature, flow_rate, vibration], dtype=np.float32)


        reward = -vibration
        if vibration > 1.0:
            reward -= 10

        done = vibration >= 1.5

        return self.state, reward, done, {}

    def render(self, mode='human'):
        print(f"State: {self.state}")
