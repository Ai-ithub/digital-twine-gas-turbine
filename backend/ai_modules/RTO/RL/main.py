import torch
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from compressor_env import CompressorEnv
from ppo_agent import PPOAgent

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load dataset
df = pd.read_csv('C:/Users/98939/Downloads/MASTER_DATASET.csv')

# Features for state (must match environment's state_features)
state_features = [
    'Pressure_In', 'Temperature_In', 'Flow_Rate', 'Pressure_Out', 'Temperature_Out',
    'Efficiency', 'Power_Consumption', 'Vibration', 'Ambient_Temperature',
    'Humidity', 'Air_Pollution', 'Fuel_Quality', 'Load_Factor',
    'vib_std', 'vib_max', 'vib_mean', 'vib_min', 'vib_rms',
    'Velocity', 'Viscosity', 'Phase_Angle'
]

# Normalize selected features
df_num = df[state_features].copy()
scaler = MinMaxScaler()
df[state_features] = scaler.fit_transform(df_num)

# Train-test split without shuffle (for time-series consistency)
df_train, df_test = train_test_split(df, test_size=0.2, shuffle=False)

# Create training environment
train_env = CompressorEnv(df_train)

# Determine dimensions
state_dim = len(train_env.state_features)
action_dim = train_env.action_space.shape[0]

# Initialize PPO agent
agent = PPOAgent(state_dim, action_dim, device=device)

# Training parameters
n_epochs = 10
timesteps_per_epoch = 2000

print("Starting PPO training...")

for epoch in range(n_epochs):
    state = train_env.reset()
    episode_reward = 0
    timestep = 0

    # Buffers
    log_probs = []
    values = []
    states = []
    actions = []
    rewards = []
    dones = []

    print(f"Initial state sample: {state}")

    while timestep < timesteps_per_epoch:
        # Convert state to tensor
        state_tensor = torch.tensor(state, dtype=torch.float32).to(device)

        # Get action, log prob, value from agent
        action, log_prob, value = agent.select_action(state_tensor)

        # Convert action to NumPy and clip to [0.0, 1.0]
        raw_action = action.cpu().numpy()
        action_clipped = np.clip(raw_action, 0.0, 1.0)

        # Step through the environment using clipped action
        next_state, reward, done, info = train_env.step(action_clipped)

        # Print debug information
        print(f"Step: {timestep}, Raw Action: {raw_action}, Clipped: {action_clipped}, Reward: {reward:.4f}")

        # Save transitions
        log_probs.append(log_prob)
        values.append(value)
        states.append(state_tensor)
        actions.append(torch.tensor(action_clipped, dtype=torch.float32).to(device))  # Use clipped action
        rewards.append(torch.tensor(reward, dtype=torch.float32).to(device))
        dones.append(torch.tensor(done, dtype=torch.float32).to(device))

        state = next_state
        episode_reward += reward
        timestep += 1

        if done:
            state = train_env.reset()

    print(f"Epoch {epoch + 1}/{n_epochs}, Total Reward: {episode_reward:.2f}")

    # Compute returns and advantages
    returns, advantages = agent.compute_gae(rewards, values, dones)

    # PPO policy update
    agent.update(states, actions, log_probs, returns, advantages)

print("Training finished.")
