from celery import Celery
from app.config import settings

celery_app = Celery(
    "bettracker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=['app.tasks']
)

celery_app.conf.timezone = "Europe/Paris"

# Planification des tâches
celery_app.conf.beat_schedule = {
    'sync-matches-every-hour': {
        'task': 'app.tasks.sync_today_matches',
        'schedule': 3600.0, # Toutes les heures (3600 secondes)
    },
}
