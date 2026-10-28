from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models

router = APIRouter(prefix="/stats", tags=["stats"])

@router.post("/calculate")
def calculate_custom_stats(analysis_ids: List[int], db: Session = Depends(get_db)):
    if not analysis_ids:
        return {"total": 0, "won": 0, "lost": 0, "pending": 0, "win_rate": 0}

    analyses = db.query(models.Analysis).filter(models.Analysis.id.in_(analysis_ids)).all()
    
    total = len(analyses)
    won = sum(1 for a in analyses if a.status == 'WON')
    lost = sum(1 for a in analyses if a.status == 'LOST')
    pending = sum(1 for a in analyses if a.status == 'PENDING')

    win_rate = round((won / (won + lost)) * 100, 2) if (won + lost) > 0 else 0

    return {
        "total": total,
        "won": won,
        "lost": lost,
        "pending": pending,
        "win_rate": win_rate
    }
