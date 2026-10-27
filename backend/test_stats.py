from app.services.football_api import get_team_stats
import json

# ID de l'Inter : on le récupère depuis la base
team_id = 505 # ID classique de l'Inter dans l'API
league_id = 135 # Serie A
season = 2023

print(f"Recherche des stats pour l'équipe {team_id} dans la ligue {league_id}...")
try:
    stats = get_team_stats(team_id, league_id, season)
    print(json.dumps(stats, indent=2))
except Exception as e:
    print(f"Erreur : {e}")
