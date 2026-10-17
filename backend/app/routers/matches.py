from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone, timedelta

from app.database import get_db
from app import models
from app.schemas import MatchOut

router = APIRouter(prefix="/matches", tags=["matches"])

@router.get("/today", response_model=List[MatchOut])
def get_today_matches(db: Session = Depends(get_db)):
    """Récupère tous les matchs du jour en base."""
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    
    matches = db.query(models.Match).filter(
        models.Match.match_date >= yesterday
    ).order_by(models.Match.match_date).all()
    
    return matches
