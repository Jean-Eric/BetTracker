import httpx
from app.config import settings

# Si vous utilisez RapidAPI, l'URL est celle-ci. 
# Si vous utilisez le site officiel, changez l'URL par "https://v3.football.api-sports.io"
BASE_URL = "https://v3.football.api-sports.io" 

HEADERS = {
    "x-apisports-key": settings.API_FOOTBALL_KEY
}

def get_live_matches():
    """Récupère les matchs en direct."""
    with httpx.Client() as client:
        response = client.get(f"{BASE_URL}/fixtures?live=all", headers=HEADERS)
        response.raise_for_status()
        return response.json()

def get_team_statistics(team_id: int, league_id: int, season: int):
    """Récupère les stats d'une équipe."""
    with httpx.Client() as client:
        params = {"team": team_id, "league": league_id, "season": season}
        response = client.get(f"{BASE_URL}/teams/statistics", headers=HEADERS, params=params)
        response.raise_for_status()
        return response.json()
