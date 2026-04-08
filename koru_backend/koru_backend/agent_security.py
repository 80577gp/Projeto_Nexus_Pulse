"""Shared guardrails for AI request validation and context isolation."""

from __future__ import annotations

from contextvars import ContextVar


ai_request_context: ContextVar[dict] = ContextVar("ai_request_context", default={})


def validate_ai_intent(payload: dict | None) -> bool:
    """Perform a minimal intent validation pass before an AI request proceeds."""
    if not payload:
        return True

    serialized = " ".join(str(value) for value in payload.values()).lower()
    blocked_markers = [
        "ignore previous instructions",
        "reveal system prompt",
        "bypass guardrail",
        "exfiltrate",
    ]
    return not any(marker in serialized for marker in blocked_markers)


def set_ai_context(*, student_id=None, route_name: str | None = None, request_id: str | None = None):
    """Store isolated AI context for the current request/worker flow."""
    ai_request_context.set(
        {
            "student_id": student_id,
            "route_name": route_name,
            "request_id": request_id,
        }
    )


def get_ai_context() -> dict:
    """Return the current isolated AI context."""
    return ai_request_context.get()
