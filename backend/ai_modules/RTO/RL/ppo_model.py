import torch
import torch.nn as nn

class Actor(nn.Module):
    """
    Neural network for policy approximation (Actor).
    Outputs actions in the range [-1, 1] which will be scaled to [0, 1].
    """
    def __init__(self, input_dim, output_dim, hidden_dim=64):
        super(Actor, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, output_dim),
            nn.Tanh()
        )

    def forward(self, state):
        return self.net(state)

class Critic(nn.Module):
    """
    Neural network for value function approximation (Critic).
    """
    def __init__(self, input_dim, hidden_dim=64):
        super(Critic, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1)
        )

    def forward(self, state):
        return self.net(state)
