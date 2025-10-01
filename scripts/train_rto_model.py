import torch
import pandas as pd
import numpy as np
import random
import pickle
import os
import sys
import mlflow
from mlflow.models import infer_signature

# --- Dummy backend.core for MLflow URI (Replace with actual import in real project) ---
class MockConfig:
    MLFLOW_TRACKING_URI = "sqlite:///mlruns.db"  # Example local tracking URI

config_mlflow = MockConfig()
# -----------------------------------------------------------------------------------

# --- Ensure necessary classes are available (Dummy or actual imports) ---
# Assuming these imports work in your environment after setting up sys.path
# from backend.ml.rto_env import CompressorEnv
# from backend.ml.rto_agent import PPOAgent

# --- Mock Classes for standalone execution (Replace with actual imports in your setup) ---
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split

# Mocking the environment and agent for demonstration
class CompressorEnv:
    def __init__(self, df, scaler=None, reward_weights=None, dynamics_models=None):
        self.state_features = ["Pressure_In", "Temperature_In", "Vibration", "Flow_Rate"]
        self.df = df
        self.scaler = scaler
        self.dynamics_models = dynamics_models or {}

    def reset(self):
        return np.zeros(len(self.state_features)), {}

    def step(self, action):
        return np.zeros(len(self.state_features)), 1.0, True, False, {}

class PPOAgent:
    def __init__(self, state_dim, action_dim, actor_hidden_dims, critic_hidden_dims, actor_lr, critic_lr, gamma, eps_clip, device):
        self.actor = torch.nn.Linear(state_dim, action_dim) # Simple mock
        self.critic = torch.nn.Linear(state_dim, 1) # Simple mock
        self.device = device
        self.state_dim = state_dim

    def select_action(self, state_tensor):
        return torch.randn(1, device=self.device), torch.tensor(0.5, device=self.device), torch.tensor(0.1, device=self.device)

    def compute_gae(self, rewards, values, dones):
        return torch.zeros_like(rewards), torch.zeros_like(values)

    def update(self, states, actions, log_probs, returns, advantages):
        pass
# ---------------------------------------------------------------------------------------


RTO_MODEL_NAME = "SGT400-RTO-Agent-Model"

def train_rto_model(config: dict):
    """
    Main function to run the PPO training and evaluation loop based on a config dictionary.
    """
    
    # --- MLflow Setup ---
    mlflow.set_tracking_uri(config_mlflow.MLFLOW_TRACKING_URI)
    mlflow.set_experiment(RTO_MODEL_NAME)

    with mlflow.start_run() as run:
        # 1. Logging Hyperparameters
        mlflow.log_params(config)  # Log all parameters in the config dictionary

        # -------- 1. Setup and Reproducibility --------
        SEED = config.get("seed", 42)
        np.random.seed(SEED)
        random.seed(SEED)
        torch.manual_seed(SEED)
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {device}")
        
        # -------- 2. Load and Preprocess Data --------
        print("Loading and preprocessing data...")
        # Using a dummy dataset path for demonstration as the environment requires a DataFrame
        DATASET_PATH = os.path.join("datasets", "MASTER_DATASET.csv")
        try:
            df = pd.read_csv(DATASET_PATH)
        except FileNotFoundError:
            print("❌ Dummy dataset not found. Creating a minimal dummy DataFrame.")
            df = pd.DataFrame(
                np.random.rand(100, 4), 
                columns=["Pressure_In", "Temperature_In", "Vibration", "Flow_Rate"]
            )


        # Define state features from the environment class for consistency
        temp_env = CompressorEnv(df.head(1))
        state_features = temp_env.state_features
        del temp_env

        # Split data BEFORE scaling
        df_train, df_test = train_test_split(df, test_size=0.2, shuffle=False)

        # Fit scaler ONLY on training data to prevent data leakage
        scaler = MinMaxScaler()
        scaler.fit(df_train[state_features])
        print("Data loaded and scaler fitted on training data.")

        # -------- 3. Initialize Environments and Agent --------
        print("Initializing environments and agent...")
        # Create the training environment
        train_env = CompressorEnv(
            df_train, scaler=scaler, reward_weights=config["reward_weights"]
        )

        # Create the evaluation environment, injecting the dynamics models from the training env
        eval_env = CompressorEnv(
            df_test, scaler=scaler, dynamics_models=train_env.dynamics_models
        )

        agent = PPOAgent(
            state_dim=len(state_features),
            action_dim=1,
            actor_hidden_dims=config["actor_hidden_dims"],
            critic_hidden_dims=config["critic_hidden_dims"],
            actor_lr=config["actor_lr"],
            critic_lr=config["critic_lr"],
            gamma=config["gamma"],
            eps_clip=config["eps_clip"],
            device=device,
        )
        print("Initialization complete.")

        # -------- 4. Training and Evaluation Loop --------
        best_eval_reward = float("-inf")
        onnx_path = "best_ppo_actor.onnx" # Defined once

        print("\n--- Starting Training & Evaluation Loop ---")
        for epoch in range(config["n_epochs"]):
            # --- Training Phase ---
            state, _ = train_env.reset()
            states, actions, log_probs, rewards, values, dones = [], [], [], [], [], []

            for t in range(config["timesteps_per_epoch"]):
                state_tensor = torch.tensor(state, dtype=torch.float32).to(device)
                action, log_prob, value = agent.select_action(state_tensor)

                next_state, reward, terminated, truncated, _ = train_env.step(
                    action.cpu().numpy()
                )

                # Store experience
                states.append(state_tensor)
                actions.append(action)
                log_probs.append(log_prob)
                values.append(value)
                rewards.append(torch.tensor(reward, dtype=torch.float32).to(device))
                dones.append(torch.tensor(terminated, dtype=torch.float32).to(device))

                state = next_state
                if terminated:
                    state, _ = train_env.reset()

            # Learn from the collected experience
            returns, advantages = agent.compute_gae(rewards, values, dones)
            agent.update(states, actions, log_probs, returns, advantages)

            # --- Evaluation Phase ---
            total_eval_reward = 0
            eval_state, _ = eval_env.reset()
            eval_done = False
            while not eval_done:
                eval_state_tensor = torch.tensor(
                    eval_state, dtype=torch.float32
                ).to(device)
                # In eval, we can act more deterministically by taking the mean
                action, _, _ = agent.select_action(
                    eval_state_tensor
                )  # We don't need log_prob or value

                next_eval_state, reward, terminated, truncated, _ = eval_env.step(
                    action.cpu().numpy()
                )
                total_eval_reward += reward
                eval_state = next_eval_state
                eval_done = terminated

            print(
                f"Epoch {epoch + 1}/{config['n_epochs']} | Evaluation Reward: {total_eval_reward:.2f}"
            )

            # Save best model based on evaluation reward
            if total_eval_reward > best_eval_reward:
                best_eval_reward = total_eval_reward

                # Save best model data (Actor/Critic weights and Scaler)
                best_model_data = {
                    "actor": agent.actor.state_dict(),
                    "critic": agent.critic.state_dict(),
                    "scaler": scaler,
                }
                with open("best_ppo_model.pkl", "wb") as f:
                    pickle.dump(best_model_data, f)
                print(
                    f"  -> New best model (.pkl) saved with reward: {best_eval_reward:.2f}"
                )

                # Export best actor to ONNX
                dummy_input = torch.randn(1, len(state_features), device=device)
                torch.onnx.export(
                    agent.actor,
                    dummy_input,
                    onnx_path, # Saves to the predefined path
                    input_names=["state"],
                    output_names=["action"],
                    opset_version=13, # Recommended opset
                )
                print(f"  -> Best actor exported to {onnx_path}")
                
        # -------- 5. Artifact Saving and MLflow Logging --------
        print("\n--- Training complete. Starting artifact logging ---")
        
        # 5a. Log final metrics (best evaluation reward)
        mlflow.log_metric("best_eval_reward", best_eval_reward)
        print(f"✅ Best Evaluation Reward logged: {best_eval_reward:.2f}")

        # 5b. Log the final Scaler
        temp_dir = "./temp_artifacts"
        os.makedirs(temp_dir, exist_ok=True)
        scaler_only_path = os.path.join(temp_dir, "rto_scaler.pkl")
        with open(scaler_only_path, "wb") as f:
            pickle.dump(scaler, f)
        mlflow.log_artifact(scaler_only_path, "scaler")
        print("✅ Scaler logged to MLflow artifacts.")

        # 5c. Log the ONNX model (The best one saved during the loop)
        mlflow.log_artifact(onnx_path, "model")
        print(f"✅ ONNX Actor Model logged to MLflow artifacts: {onnx_path}")
        
        # 5d. Register the ONNX Actor Model
        # Infer signature (using dummy input for PyTorch)
        dummy_input = torch.randn(1, len(state_features), device=device)
        # Dummy output is a single action value (e.g., [[0.0]])
        signature = infer_signature(
            dummy_input.cpu().numpy(),
            np.array([[0.0]]) 
        )
        
        # Register the ONNX Model
        logged_model_info = mlflow.register_model(
            model_uri=f"runs:/{run.info.run_id}/model/{onnx_path}",
            name=RTO_MODEL_NAME,
            tags={"model_type": "PPO_RL_Agent", "format": "ONNX"},
            signature=signature,
        )
        print(f"✅ Model registered as version: {logged_model_info.version}")
        
        # Cleanup
        os.remove(scaler_only_path)
        os.rmdir(temp_dir)
        if os.path.exists("best_ppo_model.pkl"):
            os.remove("best_ppo_model.pkl") # Remove pkl file
        if os.path.exists(onnx_path):
            os.remove(onnx_path) # Remove local onnx artifact

        print("\n--- MLflow Logging Complete. ---")


if __name__ == "__main__":
    CONFIG = {
        "seed": 42,
        "n_epochs": 100,
        "timesteps_per_epoch": 2048,
        "actor_lr": 3e-4,
        "critic_lr": 1e-3,
        "gamma": 0.99,
        "eps_clip": 0.2,
        "actor_hidden_dims": [128, 128],
        "critic_hidden_dims": [128, 128],
        "reward_weights": {"efficiency": 5.0, "power": -0.01, "vibration": -0.1},
    }
    # Ensure the artifacts directory exists for local operations (optional but good practice)
    os.makedirs("artifacts", exist_ok=True)
    train_rto_model(CONFIG)