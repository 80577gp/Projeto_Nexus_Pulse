"""
Views for the ai_integration app.

This module exposes an authenticated endpoint that proxies requests to OpenAI's
chat completion API.
"""

import os

from openai import OpenAI
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


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

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            return Response(
                {"detail": "OPENAI_API_KEY is not configured in the environment."},
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
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
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
            },
            status=status.HTTP_200_OK,
        )


# Backward-compatible alias in case the older name is referenced elsewhere.
OpenAIChatProxyView = AIGenerateContentView
