from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.enums import CouponStatus, BetResult

# === Entrées ===
class SelectionCreate(BaseModel):
    event_name: str = Field(..., min_length=1, max_length=255)
    market: str = Field(..., min_length=1, max_length=100)
    pick: str = Field(..., min_length=1, max_length=100)
    odds: float = Field(..., gt=1.0)

class CouponCreate(BaseModel):
    bookmaker_name: str = Field(..., min_length=1, max_length=50)
    stake: float = Field(..., gt=0)
    selections: List[SelectionCreate] = Field(..., min_length=1)

class ConfirmPlacement(BaseModel):
    placed: bool

class ResolveBet(BaseModel):
    result: BetResult
    actual_gain: Optional[float] = Field(None, ge=0)

class AnalysisCreate(BaseModel):
    match_id: int
    prediction_type: str
    prediction_value: str
    odds_at_analysis: Optional[float] = None
    reasoning: Optional[str] = None
    confidence: int = Field(3, ge=1, le=5)

# === Sorties ===
class SelectionOut(BaseModel):
    id: int
    event_name: str
    market: str
    pick: str
    odds: float
    class Config:
        from_attributes = True

class CouponResponse(BaseModel):
    coupon_id: int
    tracking_id: str
    tracking_url: str
    total_odds: float
    potential_gain: float

class CouponDetail(BaseModel):
    id: int
    tracking_id: str
    bookmaker_name: str
    stake: float
    total_odds: float
    potential_gain: float
    status: CouponStatus
    result: BetResult
    actual_gain: Optional[float]
    created_at: datetime
    clicked_at: Optional[datetime]
    confirmed_at: Optional[datetime]
    resolved_at: Optional[datetime]
    selections: List[SelectionOut]
    class Config:
        from_attributes = True

class BookmakerOut(BaseModel):
    id: int
    name: str
    base_url: str
    is_active: bool
    class Config:
        from_attributes = True

class TeamOut(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None
    class Config:
        from_attributes = True

class LeagueOut(BaseModel):
    id: int
    name: str
    country: Optional[str] = None
    logo_url: Optional[str] = None
    class Config:
        from_attributes = True

class MatchOut(BaseModel):
    id: int
    match_date: datetime
    status: str
    elapsed: Optional[int] = None
    home_goals: Optional[int] = None
    away_goals: Optional[int] = None
    home_team: TeamOut
    away_team: TeamOut
    league: Optional[LeagueOut] = None
    class Config:
        from_attributes = True

class AnalysisOut(BaseModel):
    id: int
    match_id: int
    prediction_type: str
    prediction_value: str
    odds_at_analysis: Optional[float]
    reasoning: Optional[str]
    confidence: int
    status: str # <-- AJOUTÉ ICI
    created_at: datetime
    match: MatchOut
    class Config:
        from_attributes = True
