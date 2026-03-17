import random

class Strategy:
    name = "Base Strategy"
    description = "No description"

    def move(self, my_history, opponent_history):
        raise NotImplementedError

class AlwaysCooperate(Strategy):
    name = "Always Cooperate"
    description = "Always plays C. Completely trusting"

    def move(self, my_history, opponent_history):
        return "C"

class AlwaysDefect(Strategy):
    name = "Always Defect"
    description = "Always plays D. Exploits cooperative strategies."

    def move(self, my_history, opponent_history):
        return "D"

class TitForTat(Strategy):
    name = "Tit For Tat"
    description = "Starts with cooperation, then copies opponents move."

    def move(self, my_history, opponent_history):
        if not opponent_history:
            return "C"
        return opponent_history[-1]

class GrimTrigger(Strategy):
    name = "Grim Trigger"
    description = "Cooperates until opponent defects. Then defects forever. Unforgiving"

    def __init__(self):
        self.triggered = False
    
    def move(self, my_history, opponent_history):
        if "D" in opponent_history:
            self.triggered = True
        if self.triggered:
            return "D"
        return "C"

class RandomStrategy(Strategy):
    name = "Random Strategy"
    description = "Random choice every time"

    def move(self, my_history, opponent_history):
        return random.choice(["C", "D"])

class Pavlov(Strategy): # Win-repeat. Lose-change
    name = "Pavlov"
    description = "Repeats move if there was a good outcome. Otherwise switches."

    def move(self, my_history, opponent_history):
        if not my_history:
            return "C"
        my_last = my_history[-1]
        opponent_last = opponent_history[-1]
        if my_last == "C" and opponent_last == "C":
            return "C"
        if my_last == "D" and opponent_last == "C":
            return "D"
        if my_last == "C" and opponent_last == "D":
            return "D"
        else:
            return "C"

class SuspiciousTitForTat(Strategy):
    name = "Suspicious Tit For Tat"
    description = "Starts with defection. Then copies opponents last move."

    def move(self, my_history, opponent_history):
        if not opponent_history:
            return "D"
        return opponent_history[-1]

class TitForTwoTats(Strategy):
    name = "Tit For Two Tats"
    description = "Defects only if the opponent defects twice in a row. A more forgiving tit for tat."

    def move(self, my_history, opponent_history):
        if len(opponent_history) < 2:
            return "C"
        if opponent_history[-1] == "D" and opponent_history[-2] == "D":
            return "D"
        return "C"

class Alternator(Strategy):
    name = "Alternator"
    description = "Alternates between cooperate and defect."

    def move(self, my_history, opponent_history):
        if not my_history:
            return "C"
        return "D" if my_history[-1] == "C" else "C"

class GenerousTitForTat(Strategy):
    name = "Generous Tit For Tat"
    description = "Like Tit For Tat but sometimes forgives defections."

    def move(self, my_history, opponent_history):
        if not opponent_history:
            return "C"

        if opponent_history[-1] == "D":
            if random.random() < 0.3:  # forgive 30% of the time
                return "C"
            return "D"

        return "C"

class MostlyCooperate(Strategy):
    name = "Mostly Cooperate"
    description = "Cooperates most of the time, defects randomly 10% of the rounds."

    def move(self, my_history, opponent_history):
        return "D" if random.random() < 0.1 else "C"
    
class MostlyDefect(Strategy):
    name = "Mostly Defect"
    description = "Defects most of the time, cooperates randomly 10% of the rounds."

    def move(self, my_history, opponent_history):
        return "C" if random.random() < 0.1 else "D"
    
class SoftGrudger(Strategy):
    name = "Soft Grudger"
    description = "Cooperates until opponent defects. Defects once in response, then returns to cooperation."

    def __init__(self):
        self.grudge = False

    def move(self, my_history, opponent_history):
        if self.grudge:
            self.grudge = False
            return "D"
        if opponent_history and opponent_history[-1] == "D":
            self.grudge = True
            return "D"
        return "C"

class Appease(Strategy):
    name = "Appease"
    description = "Does whatever the opponent did two rounds ago, creating delayed reaction dynamics."

    def move(self, my_history, opponent_history):
        if len(opponent_history) < 2:
            return "C"
        return opponent_history[-2]

class GenerousGrudger(Strategy):
    name = "Generous Grudger"
    description = "Defects once in response to a defection, but sometimes forgives repeated defections."

    def __init__(self):
        self.grudge = False

    def move(self, my_history, opponent_history):
        if self.grudge:
            self.grudge = False
            if random.random() < 0.2:  # forgive 20% of the time
                return "C"
            return "D"
        if opponent_history and opponent_history[-1] == "D":
            self.grudge = True
            return "D"
        return "C"

STRATEGY_REGISTRY = {
    "AlwaysCooperate": AlwaysCooperate,
    "AlwaysDefect": AlwaysDefect,
    "TitForTat": TitForTat,
    "GrimTrigger": GrimTrigger,
    "RandomStrategy": RandomStrategy,
    "Pavlov": Pavlov,
    "SuspiciousTitForTat": SuspiciousTitForTat,
    "TitForTwoTats": TitForTwoTats,
    "Alternator": Alternator,
    "GenerousTitForTat": GenerousTitForTat,
    "MostlyCooperate": MostlyCooperate,
    "MostlyDefect": MostlyDefect,
    "SoftGrudger": SoftGrudger,
    "Appease": Appease,
    "GenerousGrudger": GenerousGrudger
}

def get_strategy_info():
    info = []
    for key, cls in STRATEGY_REGISTRY.items():
        info.append({
            "id": key,
            "name": cls.name,
            "description": cls.description
        })
    return info