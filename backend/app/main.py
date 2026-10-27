from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine, SessionLocal

from app import models  # noqa: F401
from app.models import Bookmaker

Base.metadata.create_all(bind=engine)

# 1. On crée l'application d'abord
app = FastAPI(title="BetTracker API", version="0.1.0")

# 2. On ajoute le CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. On importe et on inclut les routers
from app.routers import coupons, redirect, stats, matches, predictions, analyses
app.include_router(coupons.router)
app.include_router(redirect.router)
app.include_router(stats.router)
app.include_router(matches.router)
app.include_router(predictions.router)
app.include_router(analyses.router)

# 4. On ajoute l'événement de démarrage
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

# 5. La route de santé
@app.get("/health")
def health():
    return {"status": "ok"}
