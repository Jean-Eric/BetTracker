import httpx
from app.config import settings
from datetime import datetime

BASE_URL = "https://v3.football.api-sports.io"
HEADERS = {
    "x-apisports-key": settings.API_FOOTBALL_KEY
}

def get_today_matches():
    """Récupère les matchs du jour."""
    today = datetime.now().strftime("%Y-%m-%d")
    with httpx.Client() as client:
        params = {"date": today}
        response = client.get(f"{BASE_URL}/fixtures", headers=HEADERS, params=params)
        response.raise_for_status()
        return response.json().get("response", [])
def get_team_stats(team_id: int, league_id: int, season: int):
    """Récupère les statistiques (buts marqués/encaissés) d'une équipe."""
    with httpx.Client() as client:
        params = {"team": team_id, "league": league_id, "season": season}
        response = client.get(f"{BASE_URL}/teams/statistics", headers=HEADERS, params=params)
        response.raise_for_status()
        return response.json().get("response", {})
