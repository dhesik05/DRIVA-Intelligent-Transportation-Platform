from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

ENV_PATH = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://driva_user:driva_password@localhost:5432/driva_db"
    JWT_SECRET_KEY: str = "changeme-super-secret-jwt-key-at-least-32-characters"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    GROQ_API_KEY: Optional[str] = None
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    class Config:
        env_file = [str(ENV_PATH), ".env", "../.env"]
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
