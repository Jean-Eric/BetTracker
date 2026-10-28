from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models

router = APIRouter(prefix="/stats", tags=["stats"])

@router.post("/save-selection")
def save_selection(analysis_ids: List[int], db: Session = Depends(get_db)):
    ids_str = ",".join(map(str, analysis_ids))
    setting = db.query(models.Setting).filter_by(key="selected_analyses").first()
    if setting:
        setting.value = ids_str
    else:
        setting = models.Setting(key="selected_analyses", value=ids_str)
        db.add(setting)
    db.commit()
    return {"message": "Sélection sauvegardée"}

@router.get("/current")
def get_current_stats(db: Session = Depends(get_db)):
    setting = db.query(models.Setting).filter_by(key="selected_analyses").first()
    
    if not setting or not setting.value:
        return {"total": 0, "won": 0, "lost": 0, "pending": 0, "win_rate": 0, "details": []}

    ids = [int(x) for x in setting.value.split(",") if x]
    analyses = db.query(models.Analysis).filter(models.Analysis.id.in_(ids)).all()
    
    total = len(analyses)
    won = sum(1 for a in analyses if a.status == 'WON')
    lost = sum(1 for a in analyses if a.status == 'LOST')
    pending = sum(1 for a in analyses if a.status == 'PENDING')
    win_rate = round((won / (won + lost)) * 100, 2) if (won + lost) > 0 else 0

    details = []
    for a in analyses:
        details.append({
            "id": a.id,
            "league": a.match.league.name if a.match.league else "Inconnu",
            "match_time": a.match.match_date,
            "home_team": a.match.home_team.name,
            "away_team": a.match.away_team.name,
            "prediction_type": a.prediction_type,
            "prediction_value": a.prediction_value,
            "odds_at_analysis": a.odds_at_analysis, # <-- AJOUT ICI
            "home_goals": a.match.home_goals,
            "away_goals": a.match.away_goals,
            "match_status": a.match.status,
            "status": a.status,
            "reasoning": a.reasoning
        })

    return {
        "total": total, "won": won, "lost": lost, "pending": pending, "win_rate": win_rate,
        "details": details
    }
