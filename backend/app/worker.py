from celery import Celery
from app.config import settings

celery_app = Celery(
    "bettracker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=['app.tasks']
)

celery_app.conf.timezone = "Europe/Paris"

celery_app.conf.beat_schedule = {
    'sync-matches-every-5-min': {
        'task': 'app.tasks.sync_today_matches',
        'schedule': 300.0, # Toutes les 5 minutes pour les matchs
    },
    'resolve-predictions-every-1-min': {
        'task': 'app.tasks.resolve_predictions',
        'schedule': 60.0, # Toutes les 1 minute pour les statuts
    },
}
