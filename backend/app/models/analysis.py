from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    
    prediction_type = Column(String(50), nullable=False) 
    prediction_value = Column(String(50), nullable=False)
    odds_at_analysis = Column(Float, nullable=True)
    reasoning = Column(Text, nullable=True)
    confidence = Column(Integer, default=3) 
    
    # Nouveau champ pour le statut (PENDING, WON, LOST, VOID)
    status = Column(String(20), default="PENDING") 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    match = relationship("Match")
