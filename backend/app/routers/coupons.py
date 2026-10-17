from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime, timezone

from app import models, schemas
from app.database import get_db
from app.config import settings

router = APIRouter(prefix="/coupons", tags=["coupons"])


@router.post("/generate", response_model=schemas.CouponResponse)
def generate_coupon(payload: schemas.CouponCreate, db: Session = Depends(get_db)):
    bookmaker = db.query(models.Bookmaker).filter_by(name=payload.bookmaker_name).first()
    if not bookmaker:
        raise HTTPException(404, f"Bookmaker '{payload.bookmaker_name}' non supporté")

    total_odds = 1.0
    for sel in payload.selections:
        total_odds *= sel.odds
    total_odds = round(total_odds, 3)
    potential_gain = round(payload.stake * total_odds, 2)

    tracking_id = str(uuid4())
    coupon = models.Coupon(
        tracking_id=tracking_id,
        bookmaker_id=bookmaker.id,
        stake=payload.stake,
        total_odds=total_odds,
        potential_gain=potential_gain,
    )
    db.add(coupon)
    db.flush()

    for sel in payload.selections:
        db.add(models.Selection(
            coupon_id=coupon.id,
            event_name=sel.event_name,
            market=sel.market,
            pick=sel.pick,
            odds=sel.odds,
        ))

    db.commit()
    db.refresh(coupon)

    return schemas.CouponResponse(
        coupon_id=coupon.id,
        tracking_id=tracking_id,
        tracking_url=f"{settings.PUBLIC_BASE_URL}/r/{tracking_id}",
        total_odds=total_odds,
        potential_gain=potential_gain,
    )


@router.get("/{coupon_id}", response_model=schemas.CouponDetail)
def get_coupon(coupon_id: int, db: Session = Depends(get_db)):
    coupon = db.query(models.Coupon).filter_by(id=coupon_id).first()
    if not coupon:
        raise HTTPException(404, "Coupon introuvable")

    return schemas.CouponDetail(
        id=coupon.id,
        tracking_id=coupon.tracking_id,
        bookmaker_name=coupon.bookmaker.name,
        stake=coupon.stake,
        total_odds=coupon.total_odds,
        potential_gain=coupon.potential_gain,
        status=coupon.status,
        result=coupon.result,
        actual_gain=coupon.actual_gain,
        created_at=coupon.created_at,
        clicked_at=coupon.clicked_at,
        confirmed_at=coupon.confirmed_at,
        resolved_at=coupon.resolved_at,
        selections=[
            schemas.SelectionOut(
                id=s.id,
                event_name=s.event_name,
                market=s.market,
                pick=s.pick,
                odds=s.odds,
            )
            for s in coupon.selections
        ],
    )


@router.post("/{tracking_id}/confirm")
def confirm_placement(
    tracking_id: str,
    payload: schemas.ConfirmPlacement,
    db: Session = Depends(get_db),
):
    coupon = db.query(models.Coupon).filter_by(tracking_id=tracking_id).first()
    if not coupon:
        raise HTTPException(404, "Coupon introuvable")

    if coupon.status not in (models.CouponStatus.CLICKED, models.CouponStatus.GENERATED):
        raise HTTPException(400, f"Statut incompatible : {coupon.status}")

    coupon.status = (
        models.CouponStatus.PLACED if payload.placed
        else models.CouponStatus.NOT_PLACED
    )
    coupon.confirmed_at = datetime.now(timezone.utc)
    db.commit()

    return {"status": coupon.status.value, "tracking_id": tracking_id}


@router.post("/{tracking_id}/resolve")
def resolve_bet(
    tracking_id: str,
    payload: schemas.ResolveBet,
    db: Session = Depends(get_db),
):
    coupon = db.query(models.Coupon).filter_by(tracking_id=tracking_id).first()
    if not coupon:
        raise HTTPException(404, "Coupon introuvable")

    if coupon.status != models.CouponStatus.PLACED:
        raise HTTPException(400, "Le coupon doit être 'placé' avant d'être résolu")

    coupon.result = payload.result
    coupon.actual_gain = payload.actual_gain
    coupon.resolved_at = datetime.now(timezone.utc)
    db.commit()

    return {"status": "resolved", "result": coupon.result.value}
