"""Security middleware for AI-facing routes."""

import json
import uuid

from django.http import JsonResponse
from django.urls import Resolver404, resolve

from core_users.models import AgentActionAudit

from .agent_security import set_ai_context, validate_ai_intent


class AgentSecurityProxy:
    """Intercept AI requests, validate intent, and isolate context by student."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            route_name = resolve(request.path_info).view_name
        except Resolver404:
            route_name = None
        request_id = str(uuid.uuid4())
        student_id = getattr(getattr(request, "user", None), "id", None)

        set_ai_context(
            student_id=student_id,
            route_name=route_name,
            request_id=request_id,
        )
        request.ai_request_id = request_id

        payload = self._extract_payload(request)

        if route_name and (
            "ai-" in route_name
            or route_name in {"token-refresh", "user-login", "user-register", "user-logout"}
        ):
            if not validate_ai_intent(payload):
                return JsonResponse(
                    {"detail": "Intent validation blocked this request."},
                    status=400,
                )

            actor = getattr(request, "user", None)
            if getattr(actor, "is_authenticated", False) and getattr(actor, "is_non_human_identity", False):
                AgentActionAudit.objects.create(
                    actor=actor,
                    action="middleware.ai_request",
                    target_resource=route_name,
                    metadata={
                        "request_id": request_id,
                        "method": request.method,
                    },
                )

        response = self.get_response(request)
        response["X-KORU-Request-ID"] = request_id
        response["X-KORU-RAG-Scope"] = f"student:{student_id}" if student_id else "student:anonymous"
        return response

    @staticmethod
    def _extract_payload(request):
        """Read JSON bodies defensively before DRF request parsing happens."""
        if request.method not in {"POST", "PUT", "PATCH"}:
            return None

        if not request.body:
            return None

        try:
            return json.loads(request.body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return None


# Backward-compatible alias matching the security audit terminology.
ShieldMiddleware = AgentSecurityProxy
