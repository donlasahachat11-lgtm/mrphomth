from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    streamlake_api_url: str = Field(
        default="https://api.streamlake.ai/v1",
        alias="STREAMLAKE_API_URL",
        validation_alias="STREAMLAKE_API_URL",
    )
    streamlake_api_key: Optional[str] = Field(default=None, alias="STREAMLAKE_API_KEY")
    gateway_api_key: Optional[str] = Field(default=None, alias="GATEWAY_API_KEY")
    cors_origins: list[str] = Field(default_factory=lambda: ["*"])

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[arg-type]
