from itertools import combinations
import random

PAYOFFS = {
    ("C", "C"): (3, 3),
    ("C", "D"): (0, 5),
    ("D", "C"): (5, 0),
    ("D", "D"): (1, 1)
}

def apply_noise(move, noise):
    if random.random() < noise:
        return "D" if move == "C" else "C"
    return move

def simulate(strategy1, strategy2, rounds=100, noise=0):
    history1 = []
    history2 = []
    score1 = 0
    score2 = 0

    results = []

    for i in range(rounds):
        move1 = strategy1.move(history1, history2)
        move2 = strategy2.move(history2, history1)

        # Apply noise
        move1 = apply_noise(move1, noise)
        move2 = apply_noise(move2, noise)

        history1.append(move1)
        history2.append(move2)

        payoff1, payoff2 = PAYOFFS[(move1, move2)]
        score1 += payoff1
        score2 += payoff2

        results.append({
            "move1": move1,
            "move2": move2,
            "score1": score1,
            "score2": score2
        })    
    
    return results

def run_tournament(strategies, rounds, noise=0):

    scores = {name: 0 for name in strategies}

    # create list of matchups
    matchups = list(combinations(strategies.items(), 2))
    # randomise order
    random.shuffle(matchups)

    for (s1_name, s1_class), (s2_name, s2_class) in matchups:
        results = simulate(s1_class(), s2_class(), rounds, noise=noise)
        final = results[-1]

        scores[s1_name] += final["score1"]
        scores[s2_name] += final["score2"]

    return scores