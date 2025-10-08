import torch
import pandas as pd
import numpy as np
import random
import pickle
import os
import sys

# Setup project root for relative imports
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
    from sklearn.preprocessing import MinMaxScaler
    from sklearn.model_selection import train_test_split
    from backend.ml.rto_env import CompressorEnv
    from backend.ml.rto_agent import PPOAgent # Assuming this is where agent logic resides


def train_rto_model(config: dict):
    """
    Main function to run the PPO training and evaluation loop.
    """
    # Get project root to save artifacts
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
    ARTIFACTS_DIR = os.path.join(PROJECT_ROOT, "artifacts")
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    # 1. Setup and Reproducibility
    SEED = config.get("seed", 42)
    np.random.seed(SEED)
    random.seed(SEED)
    torch.manual_seed(SEED)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # 2. Load and Preprocess Data
    print("Loading and preprocessing data...")
    DATASET_PATH = os.path.join(PROJECT_ROOT, "datasets", "MASTER_DATASET.csv")
    df = pd.read_csv(DATASET_PATH)

    # Define state features from the environment class
    temp_env = CompressorEnv(df.head(1))
    state_features = temp_env.state_features
    del temp_env

    # Split data BEFORE scaling
    df_train, df_test = train_test_split(df, test_size=0.2, shuffle=False)

    # Fit scaler ONLY on training data to prevent data leakage
    scaler = MinMaxScaler()
    scaler.fit(df_train[state_features])
    print("Data loaded and scaler fitted on training data.")

    # 3. Initialize Environments and Agent
    print("Initializing environments and agent...")
    train_env = CompressorEnv(
        df_train, scaler=scaler, reward_weights=config["reward_weights"]
    )
    # Use training dynamics models for evaluation env
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

    # 4. Training and Evaluation Loop
    best_eval_reward = float("-inf")
    log_interval = 500

    print("\n--- Starting Training & Evaluation Loop ---")
    for epoch in range(config["n_epochs"]):
        # Training Phase
        state, _ = train_env.reset()
        states, actions, log_probs, rewards, values, dones = [], [], [], [], [], []
        
        # Track total rewards for logging
        epoch_rewards = []
        episode_reward = 0

        for t in range(config["timesteps_per_epoch"]):
            state_tensor = torch.tensor(state, dtype=torch.float32).to(device)
            # Stochastic action selection during training
            # Note: agent.select_action should handle action clipping if necessary.
            action, log_prob, value = agent.select_action(state_tensor) 

            next_state, reward, terminated, truncated, _ = train_env.step(
                action.cpu().numpy().flatten() # Ensure action is a flat numpy array
            )

            # Store experience
            states.append(state_tensor)
            actions.append(action)
            log_probs.append(log_prob)
            values.append(value)
            rewards.append(torch.tensor(reward, dtype=torch.float32).to(device))
            dones.append(torch.tensor(terminated or truncated, dtype=torch.float32).to(device))
            
            episode_reward += reward

            state = next_state
            
            if terminated or truncated:
                epoch_rewards.append(episode_reward)
                episode_reward = 0
                state, _ = train_env.reset()
            
            if (t + 1) % log_interval == 0:
                print(f"  > Epoch {epoch + 1}/{config['n_epochs']} | Timesteps: {t + 1}/{config['timesteps_per_epoch']} done.")

        # Log the partial reward if the epoch ended before an episode completed
        if episode_reward != 0 or not epoch_rewards:
             epoch_rewards.append(episode_reward)

        # Learn from the collected experience
        returns, advantages = agent.compute_gae(rewards, values, dones)
        agent.update(states, actions, log_probs, returns, advantages)
        
        avg_train_reward = np.mean(epoch_rewards) if epoch_rewards else 0 

        # Evaluation Phase
        total_eval_reward = 0
        eval_state, _ = eval_env.reset()
        eval_done = False
        
        agent.actor.eval() # Set actor to evaluation mode
        
        # Run evaluation until the episode terminates/truncates
        while not eval_done:
            eval_state_tensor = torch.tensor(eval_state, dtype=torch.float32).to(device)
            
            with torch.no_grad():
                # IMPROVED: Use select_action with deterministic=True (assuming PPOAgent supports it)
                # If PPOAgent doesn't support a deterministic flag, the direct call to agent.actor()
                # with action clipping logic is needed. We will stick to the original logic
                # but ensure the output action is properly clipped or scaled by the agent class.
                
                # Deterministic action selection for evaluation
                action_mean = agent.actor(eval_state_tensor)
                action = action_mean
            
            # Ensure action is a flat numpy array for env.step() and clip/scale if necessary
            # **ASSUMPTION:** The PPOAgent's actor output is either naturally clipped or scaled.
            # If the environment expects actions in [0, 1], add a check/clip here if not handled by PPOAgent.
            action = action.detach().cpu().numpy().flatten()

            next_eval_state, reward, terminated, truncated, _ = eval_env.step(action)
            total_eval_reward += reward
            eval_state = next_eval_state
            eval_done = terminated or truncated
        
        agent.actor.train() # Set actor back to training mode

        print(
            f"\nEpoch {epoch + 1}/{config['n_epochs']} | Avg Training Reward: {avg_train_reward:.2f} | Evaluation Reward: {total_eval_reward:.2f}"
        )

        # Save best model based on evaluation reward
        if total_eval_reward > best_eval_reward:
            best_eval_reward = total_eval_reward

            best_model_data = {
                "actor": agent.actor.state_dict(),
                "critic": agent.critic.state_dict(),
                "scaler": scaler,
            }
            best_model_path = os.path.join(ARTIFACTS_DIR, "best_ppo_model.pkl")
            with open(best_model_path, "wb") as f:
                pickle.dump(best_model_data, f)
            print(
                f"  -> ⭐ New best model (.pkl) saved to {best_model_path} with reward: {best_eval_reward:.2f}"
            )

            # Export actor to ONNX format for deployment
            dummy_input = torch.randn(1, len(state_features), device=device)
            onnx_path = os.path.join(ARTIFACTS_DIR, "best_ppo_actor.onnx")
            torch.onnx.export(
                agent.actor,
                dummy_input,
                onnx_path,
                input_names=["state"],
                output_names=["action"],
                opset_version=11,
                # dynamic_axes={"state": {0: "batch_size"}, "action": {0: "batch_size"}}, 
            )
            print(f"  -> Best actor exported to {onnx_path}")
        else:
            print(f"  -> No improvement in Evaluation Reward. Best is still: {best_eval_reward:.2f}")


    print("\n--- Saving Scaler Separately ---")
    scaler_only_path = os.path.join(ARTIFACTS_DIR, "rto_scaler.pkl")
    with open(scaler_only_path, "wb") as f:
        pickle.dump(scaler, f)
    print(f"✅ Scaler ONLY saved to {scaler_only_path}")
    print("\n--- Training complete. ---")


if __name__ == "__main__":
    CONFIG = {
        "seed": 42,
        # Training parameters (Optimized from Code 2)
        "n_epochs": 200,                # Increased for longer training
        "timesteps_per_epoch": 4096,    # Increased collected experience per epoch
        "actor_lr": 1e-4,               # Reduced learning rate for stability
        "critic_lr": 5e-4,              # Reduced learning rate for stability
        "gamma": 0.995,                 # Increased discount factor for longer planning
        "eps_clip": 0.2,
        # Model architecture (Optimized from Code 2)
        "actor_hidden_dims": [256, 128, 64],  # Deeper network
        "critic_hidden_dims": [256, 128, 64], # Deeper network
        # Environment configuration (Optimized from Code 2)
        "reward_weights": {
            "efficiency": 10.0,
            "power": -0.005,
            "vibration": -0.2,
        },
    }
    train_rto_model(CONFIG)