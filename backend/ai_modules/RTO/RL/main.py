import torch
import pandas as pd
import numpy as np
import random
import pickle
import onnx
import os
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from compressor_env import CompressorEnv
from ppo_agent import PPOAgent

def train_rto_model():
    """
    Main function to load data, initialize the environment and agent,
    and run the PPO training loop.
    """
    # -------- Fix randomness for reproducibility --------
    SEED = 42
    np.random.seed(SEED)
    random.seed(SEED)
    torch.manual_seed(SEED)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # -------- Load and normalize data --------
    print("Loading and preprocessing data...")
    # The path now goes up three levels to reach the project root.
    # Build a robust path to the dataset file
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "../../../.."))
    DATASET_PATH = os.path.join(PROJECT_ROOT, "datasets", "MASTER_DATASET.csv")

    print(f"Attempting to load dataset from: {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH)
    
    state_features = [
        'Pressure_In', 'Temperature_In', 'Flow_Rate', 'Pressure_Out', 'Temperature_Out',
        'Efficiency', 'Power_Consumption', 'Vibration', 'Ambient_Temperature',
        'Humidity', 'Air_Pollution', 'Fuel_Quality', 'Load_Factor',
        'vib_std', 'vib_max', 'vib_mean', 'vib_min', 'vib_rms',
        'Velocity', 'Viscosity', 'Phase_Angle'
    ]
    scaler = MinMaxScaler()
    df[state_features] = scaler.fit_transform(df[state_features])
    df_train, _ = train_test_split(df, test_size=0.2, shuffle=False)
    print("Data loaded successfully.")

    # -------- Initialize environment and agent --------
    print("Initializing environment and agent...")
    env = CompressorEnv(df_train)
    agent = PPOAgent(len(state_features), 1, device=device)
    print("Initialization complete.")

    # -------- Training loop --------
    n_epochs = 10
    timesteps_per_epoch = 1000
    best_reward = float('-inf')
    
    print("\n--- Starting Training Loop ---")
    for epoch in range(n_epochs):
        state = env.reset()
        episode_reward = 0
        timestep = 0
        states, actions, log_probs, rewards, values, dones = [], [], [], [], [], []

        while timestep < timesteps_per_epoch:
            state_tensor = torch.tensor(state, dtype=torch.float32).to(device)
            action, log_prob, value = agent.select_action(state_tensor)
            action_np = np.clip(action.cpu().numpy(), 0.0, 1.0)
            next_state, reward, done, _ = env.step(action_np)

            # Store experience
            states.append(state_tensor)
            actions.append(torch.tensor(action_np, dtype=torch.float32).to(device))
            log_probs.append(log_prob)
            values.append(value)
            rewards.append(torch.tensor(reward, dtype=torch.float32).to(device))
            dones.append(torch.tensor(done, dtype=torch.float32).to(device))

            state = next_state
            episode_reward += reward
            timestep += 1

            if done:
                state = env.reset()

        print(f"Epoch {epoch + 1}/{n_epochs}, Total Reward: {episode_reward:.2f}")
        returns, advantages = agent.compute_gae(rewards, values, dones)
        agent.update(states, actions, log_probs, returns, advantages)

        # Save best model
        if episode_reward > best_reward:
            best_reward = episode_reward
            
            # --- MODIFIED SECTION: Save in both formats ---
            # Save original pickle file
            best_model_pkl = {
                'actor': agent.actor.state_dict(),
                'critic': agent.critic.state_dict(),
                'scaler': scaler
            }
            with open('best_ppo_model.pkl', 'wb') as f:
                pickle.dump(best_model_pkl, f)
            print(f"New best model (.pkl) saved with reward: {best_reward:.2f}")

            # Export the actor model to ONNX
            dummy_input = torch.randn(1, len(state_features), device=device)
            onnx_path = "best_ppo_actor.onnx"
            torch.onnx.export(agent.actor, dummy_input, onnx_path, 
                              input_names=['state'], output_names=['action'])
            print(f"Best actor model also exported to {onnx_path}")
            # --- END MODIFIED SECTION ---

    print("\n--- Training complete. ---")

# This block allows the script to be run directly
if __name__ == '__main__':
    train_rto_model()