from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    secret_key: str
    frontend_url: str = "http://localhost:3000"
    environment: str = "development"
    session_ttl_days: int = 14
    cookie_domain: str | None = None

    @property
    def is_prod(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
