# backend/app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    FIREBASE_CREDENTIALS: str # Added this

    class Config:
        env_file = ".env"

settings = Settings()