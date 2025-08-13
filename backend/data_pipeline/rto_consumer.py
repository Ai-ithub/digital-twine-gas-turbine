import os
import json
import torch
from kafka import KafkaConsumer
import redis
from ml.rto_agent import PPOAgent
from ml.rto_model import Actor, Critic

# -----------------------------
# Config
# -----------------------------
KAFKA_TOPIC = "sensors-validated"
KAFKA_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
MODEL_PATH = os.getenv("RTO_MODEL_PATH", "/app/artifacts/best_ppo_model.pkl")

# Redis
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_KEY = "latest_rto_suggestion"

STATE_DIM = int(os.getenv("RTO_STATE_DIM", 10))  
ACTION_DIM = int(os.getenv("RTO_ACTION_DIM", 3)) 

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -----------------------------
# Initialize Redis
# -----------------------------
r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

# -----------------------------
# Initialize PPO Agent
# -----------------------------
agent = PPOAgent(state_dim=STATE_DIM, action_dim=ACTION_DIM)
if os.path.exists(MODEL_PATH):
    checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
    agent.actor.load_state_dict(checkpoint["actor"])
    agent.critic.load_state_dict(checkpoint["critic"])
    print("RTO model loaded successfully.")
else:
    raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

# -----------------------------
# Initialize Kafka Consumer
# -----------------------------
consumer = KafkaConsumer(
    KAFKA_TOPIC,
    bootstrap_servers=[KAFKA_SERVERS],
    auto_offset_reset="latest",
    enable_auto_commit=True,
    group_id="rto-consumer-group",
    value_deserializer=lambda x: json.loads(x.decode("utf-8")),
)

# -----------------------------
# Consume Data & Produce Suggestions
# -----------------------------
print("Listening to Kafka topic:", KAFKA_TOPIC)
for message in consumer:
    data = message.value

    # --- Prepare state tensor ---
    sorted_keys = sorted(data.keys())
    if len(sorted_keys) != STATE_DIM:
        print(f"Warning: Expected STATE_DIM={STATE_DIM}, got {len(sorted_keys)}")
    state_values = [float(data[k]) for k in sorted_keys[:STATE_DIM]]
    state_tensor = torch.tensor(state_values, dtype=torch.float32).to(DEVICE)

    # --- Get action suggestion from PPO ---
    with torch.no_grad():
        action, _, _ = agent.select_action(state_tensor)

    # --- Store latest suggestion in Redis ---
    suggestion = action.cpu().numpy().tolist()
    r.set(REDIS_KEY, json.dumps(suggestion))

    print(f"New RTO suggestion stored in Redis: {suggestion}")
