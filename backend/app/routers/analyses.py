from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/analyses", tags=["analyses"])

@router.post("/", response_model=schemas.AnalysisOut)
def create_analysis(payload: schemas.AnalysisCreate, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter_by(id=payload.match_id).first()
    if not match:
        raise HTTPException(404, "Match introuvable")

    analysis = models.Analysis(
        match_id=payload.match_id,
        prediction_type=payload.prediction_type,
        prediction_value=payload.prediction_value,
        odds_at_analysis=payload.odds_at_analysis,
        reasoning=payload.reasoning,
        confidence=payload.confidence,
        status="PENDING"
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis

@router.get("/", response_model=List[schemas.AnalysisOut])
def get_analyses(db: Session = Depends(get_db)):
    return db.query(models.Analysis).order_by(models.Analysis.created_at.desc()).all()

@router.get("/resolve")
def resolve_analyses(db: Session = Depends(get_db)):
    """Met à jour les statuts des analyses en fonction des scores réels."""
    pending = db.query(models.Analysis).filter(models.Analysis.status == "PENDING").all()
    resolved = 0
    for a in pending:
        match = a.match
        if match.status == 'FT': # Si le match est terminé
            if a.prediction_type == '1X2':
                if a.prediction_value.lower() == 'domicile' and match.home_goals > match.away_goals:
                    a.status = 'WON'; resolved += 1
                elif a.prediction_value.lower() == 'exterieur' and match.away_goals > match.home_goals:
                    a.status = 'WON'; resolved += 1
                else:
                    a.status = 'LOST'; resolved += 1
            elif a.prediction_type == 'Over/Under':
                total_goals = match.home_goals + match.away_goals
                if 'plus' in a.prediction_value.lower() and total_goals > 2.5:
                    a.status = 'WON'; resolved += 1
                elif 'moins' in a.prediction_value.lower() and total_goals <= 2.5:
                    a.status = 'WON'; resolved += 1
                else:
                    a.status = 'LOST'; resolved += 1
    db.commit()
    return {"message": f"{resolved} analyses mises à jour"}
