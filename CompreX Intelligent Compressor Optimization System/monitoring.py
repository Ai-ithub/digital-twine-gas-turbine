# monitoring.py

import matplotlib.pyplot as plt
from stable_baselines3 import PPO
from env_rl import CompressorEnv
import time


model = PPO.load("ppo_compressor_model")


env = CompressorEnv()
obs = env.reset()


pressures, temps, flows, vibs = [], [], [], []


for step in range(100):
    action, _ = model.predict(obs)
    obs, reward, done, info = env.step(action)


    pressures.append(obs[0])
    temps.append(obs[1])
    flows.append(obs[2])
    vibs.append(obs[3])


    print(f"[{step}] P={obs[0]:.2f} | T={obs[1]:.2f} | F={obs[2]:.2f} | V={obs[3]:.2f} | R={reward:.2f}")

    if done:
        print("end")
        break

    time.sleep(0.1)


plt.figure(figsize=(10, 6))
plt.plot(pressures, label="Pressure")
plt.plot(temps, label="Temperature")
plt.plot(flows, label="Flow Rate")
plt.plot(vibs, label="Vibration")
plt.title("Real-time Monitoring of Compressor")
plt.xlabel("Time Step")
plt.ylabel("Sensor Values")
plt.legend()
plt.grid(True)
plt.show()
