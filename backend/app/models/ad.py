from sqlalchemy import Column, Integer, String, Text, Boolean
from app.database import Base

class Ad(Base):
    __tablename__ = "ads"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    color = Column(String, default="#3b82f6") # Couleur de fond de la pub
    is_active = Column(Boolean, default=True)
