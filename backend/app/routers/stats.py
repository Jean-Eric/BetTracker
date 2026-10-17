from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import analytics

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/global")
def global_stats(db: Session = Depends(get_db)):
    return {
        "by_bookmaker": analytics.get_global_stats(db),
        "roi": analytics.calculate_roi(db),
        "trend": analytics.get_trend_signal(db),
    }

@router.get("/roi")
def roi(db: Session = Depends(get_db)):
    return analytics.calculate_roi(db)

@router.get("/trend")
def trend(db: Session = Depends(get_db)):
    return analytics.get_trend_signal(db)
