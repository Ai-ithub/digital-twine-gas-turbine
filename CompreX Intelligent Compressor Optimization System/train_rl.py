

from stable_baselines3 import PPO
from stable_baselines3.common.env_checker import check_env
from env_rl import CompressorEnv
import os


env = CompressorEnv()


check_env(env, warn=True)


model = PPO("MlpPolicy", env, verbose=1)


model.learn(total_timesteps=10000)


model.save("ppo_compressor_model")

print("end")
