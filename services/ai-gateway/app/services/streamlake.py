from __future__ import annotations

from typing import AsyncGenerator, Dict, List

import httpx

from ..core.config import get_settings
from ..models.chat import ChatMessage


class StreamlakeClient:
    def __init__(self) -> None:
        settings = get_settings()
        self._base_url = settings.streamlake_api_url.rstrip("/")
        self._api_key = settings.streamlake_api_key

    @property
    def enabled(self) -> bool:
        return bool(self._api_key)

    async def stream_chat(
        self,
        messages: List[ChatMessage],
        temperature: float,
        max_tokens: int | None,
        metadata: Dict | None = None,
    ) -> AsyncGenerator[str, None]:
        if not self._api_key:
            raise RuntimeError("Streamlake API key is not configured")

        payload: Dict = {
            "messages": [message.model_dump() for message in messages],
            "temperature": temperature,
            "stream": True,
        }

        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        if metadata:
            payload["metadata"] = metadata

        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
        }

        async with httpx.AsyncClient(timeout=httpx.Timeout(60.0, read=60.0)) as client:
            async with client.stream(
                "POST",
                f"{self._base_url}/chat/completions",
                json=payload,
                headers=headers,
            ) as response:
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    yield line


streamlake_client = StreamlakeClient()
