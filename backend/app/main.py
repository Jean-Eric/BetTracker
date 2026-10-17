from fastapi import FastAPI
from app.database import Base, engine, SessionLocal

from app import models  # noqa: F401
from app.models import Bookmaker

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BetTracker API", version="0.1.0")

# Inclusion des routers
from app.routers import coupons, redirect
app.include_router(coupons.router)
app.include_router(redirect.router)

@app.on_event("startup")
def seed_bookmakers():
    db = SessionLocal()
    try:
        defaults = [
            ("Betclic", "https://www.betclic.fr"),
            ("1xbet", "https://1xbet.com/fr"),
            ("Melbet", "https://melbet.com/fr"),
            ("Paripesa", "https://paripesa.com/fr"),
        ]
        for name, url in defaults:
            if not db.query(Bookmaker).filter_by(name=name).first():
                db.add(Bookmaker(name=name, base_url=url))
        db.commit()
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "ok"}
