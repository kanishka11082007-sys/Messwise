from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Messwise API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./messwise.db"
    SYNC_DATABASE_URL: str = "sqlite:///./messwise.db"

    # JWT Security
    SECRET_KEY: str = "messwise-dev-super-secret-key-change-in-production"
    JWT_SECRET_KEY: Optional[str] = None
    ALGORITHM: str = "HS256"
    JWT_ALGORITHM: Optional[str] = None
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    # Seed Data Flag
    AUTO_SEED_DATA: bool = True

    @property
    def effective_secret_key(self) -> str:
        return self.JWT_SECRET_KEY or self.SECRET_KEY

    @property
    def effective_algorithm(self) -> str:
        return self.JWT_ALGORITHM or self.ALGORITHM

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
