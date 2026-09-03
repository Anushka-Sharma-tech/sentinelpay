from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SentinelPay API"
    app_env: str = "development"

    allowed_origins: str = "http://localhost:3000"

    supabase_url: str
    supabase_publishable_key: str
    supabase_secret_key: str

    acoustic_model_name: str = ""
    asr_model_name: str = ""
    speaker_model_name: str = ""

    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_webhook_secret: str = ""

    max_audio_seconds: int = 12
    max_audio_bytes: int = 2_000_000

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    @property
    def origins(self) -> list[str]:
        return [
            item.strip()
            for item in self.allowed_origins.split(",")
            if item.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()