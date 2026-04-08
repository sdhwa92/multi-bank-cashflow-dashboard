from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/cashflow_db"
    SECRET_KEY: str = "change-me-in-production"
    DEBUG: bool = False
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]


settings = Settings()
