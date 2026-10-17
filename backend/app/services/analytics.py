from sqlalchemy import func, case
from app import models

def get_global_stats(db):
    """Statistiques globales et par bookmaker."""
    rows = db.query(
        models.Bookmaker.name,
        func.count(models.Coupon.id).label("generated"),
        func.sum(case((models.Coupon.status == models.CouponStatus.CLICKED, 1), else_=0)).label("clicked"),
        func.sum(case((models.Coupon.status == models.CouponStatus.PLACED, 1), else_=0)).label("placed"),
        func.sum(case((models.Coupon.status == models.CouponStatus.NOT_PLACED, 1), else_=0)).label("not_placed"),
    ).join(models.Coupon).group_by(models.Bookmaker.name).all()
    return [dict(r._mapping) for r in rows]

def calculate_roi(db):
    """ROI calculé uniquement sur les paris PLACÉS et RÉSOLUS."""
    resolved = db.query(models.Coupon).filter(
        models.Coupon.status == models.CouponStatus.PLACED,
        models.Coupon.result != models.BetResult.PENDING,
    ).all()
    
    if not resolved:
        return {"roi": 0.0, "total_staked": 0.0, "total_returned": 0.0, "count": 0, "won": 0, "lost": 0, "win_rate": 0.0}
    
    total_staked = sum(c.stake for c in resolved)
    total_returned = 0.0
    won = lost = 0
    
    for c in resolved:
        if c.result == models.BetResult.WON:
            total_returned += c.actual_gain or 0
            won += 1
        elif c.result == models.BetResult.LOST:
            lost += 1
        elif c.result in (models.BetResult.VOID, models.BetResult.CASHOUT):
            total_returned += c.stake
    
    roi = ((total_returned - total_staked) / total_staked * 100) if total_staked else 0
    return {
        "roi": round(roi, 2),
        "total_staked": round(total_staked, 2),
        "total_returned": round(total_returned, 2),
        "count": len(resolved),
        "won": won,
        "lost": lost,
        "win_rate": round(won / (won + lost) * 100, 2) if (won + lost) else 0,
    }

def get_trend_signal(db, last_n: int = 10):
    """Retourne un signal de tendance basé sur les N derniers paris résolus."""
    resolved = db.query(models.Coupon).filter(
        models.Coupon.status == models.CouponStatus.PLACED,
        models.Coupon.result != models.BetResult.PENDING,
    ).order_by(models.Coupon.resolved_at.desc()).limit(last_n).all()
    
    if len(resolved) < 5:
        return {"signal": "neutral", "message": "Pas assez de données pour évaluer la tendance."}
    
    profits = []
    for c in resolved:
        if c.result == models.BetResult.WON:
            profits.append((c.actual_gain or 0) - c.stake)
        elif c.result == models.BetResult.LOST:
            profits.append(-c.stake)
        else:
            profits.append(0)
    
    total = sum(profits)
    streak_loss = 0
    for p in profits:
        if p < 0:
            streak_loss += 1
        else:
            break
            
    streak_win = 0
    for p in profits:
        if p > 0:
            streak_win += 1
        else:
            break
    
    if streak_loss >= 3:
        return {"signal": "danger", "message": f"⚠️ {streak_loss} pertes consécutives. Envisagez une pause."}
    if total < 0:
        return {"signal": "warning", "message": "Tendance négative sur les derniers paris. Prudence."}
    if streak_win >= 3 or total > 0:
        return {"signal": "good", "message": "✅ Tendance positive. Continuez avec votre stratégie."}
    return {"signal": "neutral", "message": "Tendance neutre."}
