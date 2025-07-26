import torch
import torch.nn.functional as F
from torch.distributions import Normal
from ppo_model import Actor, Critic

class PPOAgent:
    def __init__(self, state_dim, action_dim, actor_lr=1e-4, critic_lr=1e-3, gamma=0.99, eps_clip=0.2, device=None):
        self.device = device if device is not None else torch.device("cpu")
        self.actor = Actor(state_dim, action_dim).to(self.device)
        self.critic = Critic(state_dim).to(self.device)
        self.actor_optimizer = torch.optim.Adam(self.actor.parameters(), lr=actor_lr)
        self.critic_optimizer = torch.optim.Adam(self.critic.parameters(), lr=critic_lr)
        self.gamma = gamma
        self.eps_clip = eps_clip

    def select_action(self, state):
        state = state.unsqueeze(0).to(self.device)  # Add batch dimension and move to device
        mean = self.actor(state)
        std = torch.ones_like(mean).to(self.device) * 0.1  # Constant std on same device
        dist = Normal(mean, std)  # Continuous distribution
        action = dist.sample()
        log_prob = dist.log_prob(action).sum(dim=-1)
        value = self.critic(state)
        return action.squeeze(0), log_prob.squeeze(0), value.squeeze(0)

    def compute_returns(self, rewards):
        returns = []
        R = 0
        for r in reversed(rewards):
            R = r + self.gamma * R
            returns.insert(0, R)
        return torch.tensor(returns, dtype=torch.float32).to(self.device)

    def compute_gae(self, rewards, values, dones, lam=0.95):
        returns = []
        gae = 0
        values = values + [values[-1].detach()]
        for step in reversed(range(len(rewards))):
            delta = rewards[step] + self.gamma * values[step + 1] * (1 - dones[step]) - values[step]
            gae = delta + self.gamma * lam * (1 - dones[step]) * gae
            returns.insert(0, gae + values[step])
        advantages = [ret - val for ret, val in zip(returns, values[:-1])]
        return torch.stack(returns).to(self.device), torch.stack(advantages).to(self.device)

    def update(self, states, actions, log_probs_old, returns, advantages):
        # Stack lists into tensors and move to device
        states = torch.stack(states).to(self.device)
        actions = torch.stack(actions).to(self.device)
        log_probs_old = torch.stack(log_probs_old).to(self.device)
        returns = returns.to(self.device).detach()
        advantages = advantages.to(self.device).detach()
        
        # Critic update
        self.critic_optimizer.zero_grad()
        values = self.critic(states).squeeze()
        returns = returns.squeeze()
        critic_loss = F.mse_loss(values, returns)  # Make sure shapes match
        critic_loss.backward()
        self.critic_optimizer.step()

        # Actor update
        self.actor_optimizer.zero_grad()
        mean = self.actor(states)
        std = torch.ones_like(mean).to(self.device) * 0.1
        dist = Normal(mean, std)

        # Make sure actions are properly shaped for log_prob
        actions = actions.view_as(mean)
        log_probs_new = dist.log_prob(actions).sum(dim=-1)

        ratios = torch.exp(log_probs_new - log_probs_old)
        surr1 = ratios * advantages
        surr2 = torch.clamp(ratios, 1 - self.eps_clip, 1 + self.eps_clip) * advantages

        actor_loss = -torch.min(surr1, surr2).mean()
        actor_loss.backward()
        self.actor_optimizer.step()
