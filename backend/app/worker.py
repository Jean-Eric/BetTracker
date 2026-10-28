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
        'schedule': 300.0,
    },
    'resolve-predictions-every-10-min': {
        'task': 'app.tasks.resolve_predictions',
        'schedule': 600.0,
    },
}
