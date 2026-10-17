from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Bookmaker(Base):
    __tablename__ = "bookmakers"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    base_url = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    coupons = relationship("Coupon", back_populates="bookmaker")
