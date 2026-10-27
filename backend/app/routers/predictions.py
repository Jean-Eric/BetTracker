from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.services.football_api import get_team_stats
from app.services.predictor import calculate_match_probabilities

router = APIRouter(prefix="/predictions", tags=["predictions"])

@router.get("/match/{match_id}")
def get_match_prediction(match_id: int, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter_by(id=match_id).first()
    if not match:
        raise HTTPException(404, "Match introuvable")

    league_id = match.league_id
    # On force la saison 2023 pour être sûr d'avoir des stats complètes
    season = 2023 

    home_stats = get_team_stats(match.home_team_id, league_id, season)
    away_stats = get_team_stats(match.away_team_id, league_id, season)

    try:
        h_attack = float(home_stats['goals']['for']['average']['home'])
        h_defense = float(home_stats['goals']['against']['average']['home'])
    except (KeyError, TypeError, ValueError):
        h_attack = 1.5
        h_defense = 1.2

    try:
        a_attack = float(away_stats['goals']['for']['average']['away'])
        a_defense = float(away_stats['goals']['against']['average']['away'])
    except (KeyError, TypeError, ValueError):
        a_attack = 1.2
        a_defense = 1.5

    probabilities = calculate_match_probabilities(
        home_attack=h_attack,
        home_defense=h_defense,
        away_attack=a_attack,
        away_defense=a_defense
    )

    return {
        "match_id": match.id,
        "home_team": match.home_team.name,
        "away_team": match.away_team.name,
        "statistiques_utilisees": {
            "home_attack_avg": h_attack,
            "home_defense_avg": h_defense,
            "away_attack_avg": a_attack,
            "away_defense_avg": a_defense
        },
        "probabilites": probabilities
    }
