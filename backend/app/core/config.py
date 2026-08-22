from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET: str
    OLLAMA_URL: str
    OLLAMA_MODEL: str

    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")


settings = Settings()