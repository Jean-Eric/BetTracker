from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.models.enums import CouponStatus, BetResult

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True)
    tracking_id = Column(String(36), unique=True, index=True, nullable=False)
    bookmaker_id = Column(Integer, ForeignKey("bookmakers.id"), nullable=False)
    stake = Column(Float, nullable=False)
    total_odds = Column(Float, nullable=False)
    potential_gain = Column(Float, nullable=False)
    status = Column(Enum(CouponStatus), default=CouponStatus.GENERATED, index=True)
    result = Column(Enum(BetResult), default=BetResult.PENDING, index=True)
    actual_gain = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    clicked_at = Column(DateTime(timezone=True), nullable=True)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    bookmaker = relationship("Bookmaker", back_populates="coupons")
    selections = relationship("Selection", back_populates="coupon", cascade="all, delete-orphan")

class Selection(Base):
    __tablename__ = "selections"

    id = Column(Integer, primary_key=True)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=False)
    event_name = Column(String, nullable=False)
    market = Column(String, nullable=False)
    pick = Column(String, nullable=False)
    odds = Column(Float, nullable=False)
    event_date = Column(DateTime(timezone=True), nullable=True)

    coupon = relationship("Coupon", back_populates="selections")
