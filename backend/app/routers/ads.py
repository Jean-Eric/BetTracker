from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/ads", tags=["ads"])

@router.get("/", response_model=List[schemas.AdOut])
def get_all_ads(db: Session = Depends(get_db)):
    # On renvoie TOUTES les pubs (actives et inactives) pour l'admin
    return db.query(models.Ad).all()

@router.post("/", response_model=schemas.AdOut)
def create_ad(payload: schemas.AdCreate, db: Session = Depends(get_db)):
    ad = models.Ad(**payload.dict())
    db.add(ad)
    db.commit()
    db.refresh(ad)
    return ad

@router.put("/{ad_id}/toggle", response_model=schemas.AdOut)
def toggle_ad(ad_id: int, db: Session = Depends(get_db)):
    ad = db.query(models.Ad).filter_by(id=ad_id).first()
    if not ad:
        raise HTTPException(404, "Publicité introuvable")
    ad.is_active = not ad.is_active
    db.commit()
    db.refresh(ad)
    return ad
