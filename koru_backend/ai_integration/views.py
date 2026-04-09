"""Views for the ai_integration app."""

import os

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from koru_backend.agent_security import get_ai_context, validate_ai_intent
from .services import build_gap_analysis_prompt, request_gap_analysis


class AIGenerateContentView(APIView):
    """
    Authenticated endpoint for AI-generated educational content.

    The client sends a prompt and a request type, and this view builds a guided
    system message before forwarding the request to OpenAI.
    """

    permission_classes = [IsAuthenticated]

    SYSTEM_PROMPTS = {
        "mind_map": (
            "You are an educational assistant that creates concise and well-"
            "structured mind maps for students."
        ),
        "study_tips": (
            "You are an academic mentor that gives practical, encouraging, and "
            "clear study tips tailored to the student's needs."
        ),
        "code_help": (
            "You are a programming tutor who explains code clearly, suggests "
            "improvements, and helps solve technical problems step by step."
        ),
    }

    def post(self, request, *args, **kwargs):
        """
        Send the user's prompt to OpenAI and return the generated response.

        Expected payload:
        - prompt_text: text prompt sent by the user
        - request_type: category of assistance, such as mind_map or study_tips
        """

        prompt_text = request.data.get("prompt_text")
        request_type = request.data.get("request_type", "study_tips")

        if not prompt_text:
            return Response(
                {"detail": "The 'prompt_text' field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not validate_ai_intent(request.data):
            return Response(
                {"detail": "Intent validation blocked this request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            return Response(
                {"detail": "OPENAI_API_KEY is not configured in the environment."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if OpenAI is None:
            return Response(
                {"detail": "The OpenAI Python package is not installed."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        system_message = self.SYSTEM_PROMPTS.get(
            request_type,
            (
                "You are a helpful educational assistant that provides clear, "
                "accurate, and student-friendly responses."
            ),
        )

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt_text},
        ]

        try:
            client = OpenAI(api_key=api_key)
            context = get_ai_context()
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                metadata={
                    "request_id": context.get("request_id"),
                    "route_name": context.get("route_name"),
                    "rag_scope": context.get("rag_scope"),
                },
            )
        except Exception as exc:
            return Response(
                {"detail": f"OpenAI request failed: {str(exc)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        ai_response = completion.choices[0].message.content

        return Response(
            {
                "request_type": request_type,
                "prompt_text": prompt_text,
                "response": ai_response,
                "rag_scope": get_ai_context().get("rag_scope"),
            },
            status=status.HTTP_200_OK,
        )


# Backward-compatible alias in case the older name is referenced elsewhere.
OpenAIChatProxyView = AIGenerateContentView


class DeepScanAnalysisView(APIView):
    """Authenticated endpoint that returns structured root-cause analysis."""

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        student_failure_summary = request.data.get("student_failure_summary")
        target_skill = request.data.get("target_skill")
        expected_answer = request.data.get("expected_answer")
        prerequisite_skills = request.data.get("prerequisite_skills") or []
        additional_context = request.data.get("additional_context")

        if not student_failure_summary or not target_skill:
            return Response(
                {
                    "detail": (
                        "Both 'student_failure_summary' and 'target_skill' are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if prerequisite_skills and not isinstance(prerequisite_skills, list):
            return Response(
                {"detail": "'prerequisite_skills' must be a list of strings."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        prompt = build_gap_analysis_prompt(
            student_failure_summary=student_failure_summary,
            target_skill=target_skill,
            expected_answer=expected_answer,
            prerequisite_skills=[str(item) for item in prerequisite_skills],
            additional_context=additional_context,
        )

        try:
            result = request_gap_analysis(prompt=prompt)
        except Exception as exc:
            return Response(
                {"detail": f"DeepScan request failed: {str(exc)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "analysis": result.model_dump(),
                "rag_scope": get_ai_context().get("rag_scope"),
            },
            status=status.HTTP_200_OK,
        )
