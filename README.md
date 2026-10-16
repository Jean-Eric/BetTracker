# BetTracker

Outil personnel d'analyse et de suivi de paris sportifs (football).

## Architecture
- backend/ : API FastAPI + workers Celery
- frontend/ : PWA (React + Vite)
- docs/ : Documentation

## Démarrage rapide
cp .env.example .env
docker compose up -d --build

## Accès
- API : http://localhost:8000/docs
- Frontend : http://localhost:5173
