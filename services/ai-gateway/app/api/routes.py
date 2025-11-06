from __future__ import annotations

import json
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, StreamingResponse

from ..core.config import Settings, get_settings
from ..models.chat import ChatChunk, ChatRequest
from ..services.streamlake import streamlake_client


router = APIRouter(prefix="/chat", tags=["chat"])


def ensure_authorized(request: Request, settings: Settings) -> None:
    if not settings.gateway_api_key:
        return

    provided = request.headers.get("X-API-Key") or request.headers.get("x-api-key")
    if provided != settings.gateway_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid gateway API key")


def to_sse(chunk: ChatChunk) -> str:
    return f"data: {chunk.model_dump_json()}\n\n"


@router.post("", response_model=None)
async def create_chat_completion(
    chat_request: ChatRequest,
    request: Request,
    settings: Settings = Depends(get_settings),
):
    ensure_authorized(request, settings)

    if chat_request.provider != "streamlake":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported provider")

    if not streamlake_client.enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Streamlake integration is not configured",
        )

    async def stream_response() -> AsyncGenerator[str, None]:
        send_done = False
        try:
            async for provider_line in streamlake_client.stream_chat(
                messages=chat_request.messages,
                temperature=chat_request.temperature,
                max_tokens=chat_request.max_tokens,
                metadata=chat_request.metadata,
            ):
                normalized = provider_line.strip()
                if not normalized:
                    continue

                if normalized.startswith("data:"):
                    normalized = normalized[5:].strip()

                if normalized in {"[DONE]", "DONE"}:
                    send_done = True
                    yield to_sse(ChatChunk(type="done", metadata={"provider": "streamlake"}))
                    continue

                try:
                    parsed = json.loads(normalized)
                    content = parsed.get("content") or parsed.get("delta", {}).get("content")
                    metadata = parsed.get("metadata")
                except json.JSONDecodeError:
                    content = normalized
                    metadata = None

                yield to_sse(
                    ChatChunk(
                        type="chunk",
                        content=content,
                        metadata=metadata or {"provider": "streamlake"},
                    )
                )

        except Exception as exc:  # pragma: no cover - defensive to surface upstream failures
            send_done = True
            yield to_sse(ChatChunk(type="error", error=str(exc)))
        finally:
            if not send_done:
                yield to_sse(ChatChunk(type="done", metadata={"provider": "streamlake"}))

    if not chat_request.stream:
        aggregated_content = []
        async for chunk in stream_response():
            payload = json.loads(chunk.replace("data:", "").strip())
            if payload["type"] == "chunk" and payload.get("content"):
                aggregated_content.append(payload["content"])
            elif payload["type"] == "error":
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=payload["error"])
        return JSONResponse(
            content={
                "content": "".join(aggregated_content),
                "provider": "streamlake",
            }
        )

    return StreamingResponse(stream_response(), media_type="text/event-stream")
