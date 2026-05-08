#First Experiment:
'''
Direct Preference Optimization (DPO)

actions = updating the prompt of the Diffusion Model
state = the current prompt, the features of the input image? (style, genre, artist)

#There will be two choices, and 
the one chosen will be given a reward of 1 and the other will be given a reward of 0.
'''
import random
from collections import deque, namedtuple
import torch
import numpy as np
import torch.nn as nn
import torch.nn.functional as F


def set_seed(seed):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)

set_seed(42)


Expert = namedtuple("Expert", ('state', 'action'))
class ReplayMemory(object):
    def __init__(self, capacity):
        self.capacity = capacity
        self.memory = deque([], maxlen=capacity)

    def push(self, *args):
        self.memory.append()
    
    def sample(self, batch_size):
        if batch_size <= len(self.memory):
            return random.sample(self.memory, batch_size)
        else:
            return random.choices(self.memory, k=batch_size)

    def __len__(self):
        return len(self.memory)


class DPO(nn.Module):
    def __init__(self, dim, n_actions, args):
        super(DPO, self).__init__()
        self.dim = dim
        self.n_actions = n_actions
        self.args = args

        self.sequence = nn.Sequential(
            nn.Linear(dim, 128),
            nn.Linear(128, 128), 
            nn.Linear(128, 128), 
            nn.Linear(128, n_actions)
        )
    
    def forward(self, x):
        x = self.sequence(x)
        x = F.softmax(dim = 1)(x)
        return x
    
    # def loss(self, expert_action_probs, policy_action_probs, rewards):
    #     loss = 
    
