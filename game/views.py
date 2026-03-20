import json
from django.http import JsonResponse
from django.shortcuts import render

from .engine import simulate, run_tournament
from .strategies import STRATEGY_REGISTRY, get_strategy_info
from .models import MatchResult

# Create your views here.
def index(request):
    return render(request, "game/index.html")

@csrf_exempt
def simulate_view(request):
    if request.method == "POST":
        data = json.loads(request.body)

        strategy1_name = data.get("strategy1")
        strategy2_name = data.get("strategy2")
        rounds = int(data.get("rounds", 100))
        noise = float(data.get("noise", 0))

        strategy1_class = STRATEGY_REGISTRY[strategy1_name]
        strategy2_class = STRATEGY_REGISTRY[strategy2_name]

        strategy1 = strategy1_class()
        strategy2 = strategy2_class()

        results = simulate(strategy1, strategy2, rounds, noise=noise)
        final = results[-1]

        # Save match result
        MatchResult.objects.create(
            strategy1=strategy1_name,
            strategy2=strategy2_name,
            score1=final["score1"],
            score2=final["score2"],
            rounds=rounds,
            noise=noise
        )
        return JsonResponse(results, safe=False)

    return JsonResponse({"error": "POST request required"}, status=400)

def tournament_view(request):
    data = json.loads(request.body)
    rounds = int(data.get("rounds", 100))
    noise = float(data.get("noise", 0))
    scores = run_tournament(STRATEGY_REGISTRY, rounds, noise=noise)

    leaderboard = sorted(scores.items(), key=lambda x: -x[1])

    return JsonResponse({
        "leaderboard": leaderboard
    })

def strategies_view(request):
    return JsonResponse(get_strategy_info(), safe=False)