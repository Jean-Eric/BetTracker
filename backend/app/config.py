from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str
    PUBLIC_BASE_URL: str = "http://localhost:8000"
    SECRET_KEY: str = "change-me"
    
    # Clé API Football
    API_FOOTBALL_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
