import torch
import pandas as pd
import numpy as np
import random
import pickle
import onnx
from urllib.parse import quote_plus # <-- THIS LINE WAS MISSING
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from compressor_env import CompressorEnv
from ppo_agent import PPOAgent

def train_rto_model():
    """
    Main function to load data FROM THE DATABASE, initialize the environment 
    and agent, and run the PPO training loop.
    """
    # --- 1. Load Configuration ---
    load_dotenv()
    DB_CONFIG = {
        "host": os.getenv("DB_HOST", "127.0.0.1"),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD"),
        "database": os.getenv("DB_DATABASE", "compressor_db"),
    }

    # -------- Fix randomness for reproducibility --------
    SEED = 42
    np.random.seed(SEED)
    random.seed(SEED)
    torch.manual_seed(SEED)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # -------- Load and normalize data FROM DATABASE --------
    print("Connecting to database and loading data...")
    try:
        encoded_password = quote_plus(DB_CONFIG['password'])
        connection_str = (
            f"mysql+pymysql://{DB_CONFIG['user']}:{encoded_password}"
            f"@{DB_CONFIG['host']}/{DB_CONFIG['database']}"
        )
        engine = create_engine(connection_str)
        df = pd.read_sql("SELECT * FROM compressor_data", engine)
        
    except Exception as e:
        print(f"❌ Failed to load data from database: {e}")
        return

    state_features = [
        'Pressure_In', 'Temperature_In', 'Flow_Rate', 'Pressure_Out', 'Temperature_Out',
        'Efficiency', 'Power_Consumption', 'Vibration', 'Ambient_Temperature',
        'Humidity', 'Air_Pollution', 'Fuel_Quality', 'Load_Factor',
        'vib_std', 'vib_max', 'vib_mean', 'vib_min', 'vib_rms',
        'Velocity', 'Viscosity', 'Phase_Angle'
    ]
    
    if not all(feature in df.columns for feature in state_features):
        print("❌ Error: Not all required state_features were found in the database table.")
        return

    scaler = MinMaxScaler()
    df[state_features] = scaler.fit_transform(df[state_features])
    df_train, _ = train_test_split(df, test_size=0.2, shuffle=False)
    print("Data loaded and preprocessed successfully.")
    
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

        if episode_reward > best_reward:
            best_reward = episode_reward
            best_model_pkl = {
                'actor': agent.actor.state_dict(),
                'critic': agent.critic.state_dict(),
                'scaler': scaler
            }
            with open('best_ppo_model.pkl', 'wb') as f:
                pickle.dump(best_model_pkl, f)
            print(f"New best model (.pkl) saved with reward: {best_reward:.2f}")

            dummy_input = torch.randn(1, len(state_features), device=device)
            onnx_path = "best_ppo_actor.onnx"
            torch.onnx.export(agent.actor, dummy_input, onnx_path, 
                              input_names=['state'], output_names=['action'])
            print(f"Best actor model also exported to {onnx_path}")

    print("\n--- Training complete. ---")

if __name__ == '__main__':
    train_rto_model()