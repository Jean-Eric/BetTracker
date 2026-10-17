from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True)  # On utilisera l'ID de l'API
    name = Column(String, nullable=False, index=True)
    logo_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class League(Base):
    __tablename__ = "leagues"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    country = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    season = Column(Integer, nullable=True) # Année de la saison en cours

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True) # ID de l'API
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=True)
    home_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    away_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    
    match_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default="NS") # NS = Not Started, FT = Full Time, etc.
    
    home_goals = Column(Integer, nullable=True)
    away_goals = Column(Integer, nullable=True)
    
    # Cotes (seront remplies plus tard si besoin)
    odds_home = Column(Float, nullable=True)
    odds_draw = Column(Float, nullable=True)
    odds_away = Column(Float, nullable=True)

    home_team = relationship("Team", foreign_keys=[home_team_id])
    away_team = relationship("Team", foreign_keys=[away_team_id])
    league = relationship("League")
