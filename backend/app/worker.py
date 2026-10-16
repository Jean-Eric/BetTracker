from celery import Celery
from app.config import settings

celery_app = Celery(
    "bettracker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.timezone = "Europe/Paris"
