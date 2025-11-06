from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


ChatRole = Literal["system", "user", "assistant"]


class ChatMessage(BaseModel):
    role: ChatRole
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    provider: Literal["streamlake"] = "streamlake"
    session_id: Optional[str] = None
    prompt_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(default=None, ge=1)
    stream: bool = True


class ChatChunk(BaseModel):
    type: Literal["chunk", "error", "done"]
    content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
