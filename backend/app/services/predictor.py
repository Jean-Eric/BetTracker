import math

def poisson_probability(k: int, lambd: float) -> float:
    """Calcule la probabilité d'avoir exactement k buts avec une moyenne lambd."""
    return (lambd**k * math.exp(-lambd)) / math.factorial(k)

def calculate_match_probabilities(home_attack, home_defense, away_attack, away_defense, league_avg_goals=2.5):
    """
    Calcule les probabilités de scores et de marchés.
    home_attack / away_attack : moyenne de buts marqués par match
    home_defense / away_defense : moyenne de buts encaissés par match
    league_avg_goals : moyenne de buts par match dans la ligue (par défaut 2.5)
    """
    # Calcul des forces attendues (espérance de buts)
    # On normalise par la moyenne de la ligue pour équilibrer
    league_avg = league_avg_goals / 2
    
    if league_avg == 0:
        league_avg = 1.25 # Sécurité pour éviter la division par zéro

    lambda_home = (home_attack / league_avg) * (away_defense / league_avg) * league_avg
    lambda_away = (away_attack / league_avg) * (home_defense / league_avg) * league_avg

    # On limite pour éviter des scores irréalistes
    lambda_home = max(0.1, min(lambda_home, 4.0))
    lambda_away = max(0.1, min(lambda_away, 4.0))

    prob_home_win = 0.0
    prob_away_win = 0.0
    prob_draw = 0.0
    prob_over_25 = 0.0
    prob_btts = 0.0

    # On calcule les probabilités pour tous les scores de 0-0 à 5-5
    for i in range(0, 6):
        for j in range(0, 6):
            prob = poisson_probability(i, lambda_home) * poisson_probability(j, lambda_away)
            
            # Résultat du match
            if i > j:
                prob_home_win += prob
            elif i < j:
                prob_away_win += prob
            else:
                prob_draw += prob

            # Plus de 2.5 buts
            if (i + j) > 2.5:
                prob_over_25 += prob

            # Les deux équipes marquent (BTTS)
            if i > 0 and j > 0:
                prob_btts += prob

    return {
        "home_win": round(prob_home_win * 100, 2),
        "draw": round(prob_draw * 100, 2),
        "away_win": round(prob_away_win * 100, 2),
        "over_2_5": round(prob_over_25 * 100, 2),
        "btts": round(prob_btts * 100, 2),
        "expected_goals": {
            "home": round(lambda_home, 2),
            "away": round(lambda_away, 2),
            "total": round(lambda_home + lambda_away, 2)
        }
    }
