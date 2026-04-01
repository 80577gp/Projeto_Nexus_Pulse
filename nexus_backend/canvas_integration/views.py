"""
Views for the canvas_integration app.

This module provides endpoints to start the Canvas OAuth2 flow, process the
callback, and expose synchronized Canvas data for the authenticated user.
"""

import os
from urllib.parse import urlencode

import requests
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CanvasAssignment, CanvasCourse, CanvasGrade, CanvasIntegration
from .serializers import (
    CanvasAssignmentSerializer,
    CanvasCourseSerializer,
    CanvasGradeSerializer,
    CanvasIntegrationSerializer,
)


class CanvasOAuth2InitiateView(APIView):
    """
    Start the Canvas OAuth2 authorization flow for the authenticated user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """Return the Canvas authorization URL for the frontend to redirect to."""
        client_id = os.environ.get("CANVAS_CLIENT_ID")
        redirect_uri = os.environ.get("CANVAS_REDIRECT_URI")
        base_url = os.environ.get("CANVAS_BASE_URL")

        if not client_id or not redirect_uri or not base_url:
            return Response(
                {"detail": "Canvas OAuth environment variables are not configured."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        query = urlencode(
            {
                "client_id": client_id,
                "response_type": "code",
                "redirect_uri": redirect_uri,
            }
        )
        authorization_url = f"{base_url.rstrip('/')}/login/oauth2/auth?{query}"

        return Response(
            {"authorization_url": authorization_url},
            status=status.HTTP_200_OK,
        )


class CanvasOAuth2CallbackView(APIView):
    """
    Handle the OAuth2 callback from Canvas and persist the integration tokens.
    """

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        """
        Exchange the authorization code for tokens and store the integration.

        Expected query params:
        - code: authorization code returned by Canvas
        - state: optional user identifier supplied by the frontend
        - user_id: fallback user identifier when state is not used
        """

        code = request.query_params.get("code")
        user_id = request.query_params.get("state") or request.query_params.get("user_id")

        if not code:
            return Response(
                {"detail": "The 'code' query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user_id:
            return Response(
                {
                    "detail": (
                        "The callback requires a user identifier in 'state' or 'user_id'."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        client_id = os.environ.get("CANVAS_CLIENT_ID")
        client_secret = os.environ.get("CANVAS_CLIENT_SECRET")
        redirect_uri = os.environ.get("CANVAS_REDIRECT_URI")
        base_url = os.environ.get("CANVAS_BASE_URL")

        if not client_id or not client_secret or not redirect_uri or not base_url:
            return Response(
                {"detail": "Canvas OAuth environment variables are not configured."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        token_url = f"{base_url.rstrip('/')}/login/oauth2/token"
        payload = {
            "grant_type": "authorization_code",
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "code": code,
        }

        try:
            token_response = requests.post(token_url, data=payload, timeout=15)
            token_response.raise_for_status()
            token_data = token_response.json()
        except Exception as exc:
            return Response(
                {"detail": f"Canvas token exchange failed: {str(exc)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        expires_at = token_data.get("expires_at")

        if not access_token:
            return Response(
                {"detail": "Canvas did not return an access token."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        try:
            integration, _ = CanvasIntegration.objects.update_or_create(
                user_id=user_id,
                defaults={
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "token_expires_at": (
                        parse_datetime(expires_at) if isinstance(expires_at, str) else None
                    ),
                },
            )
        except Exception as exc:
            return Response(
                {"detail": f"Failed to persist Canvas integration: {str(exc)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            CanvasIntegrationSerializer(integration).data,
            status=status.HTTP_200_OK,
        )


class CanvasCourseViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to synchronized Canvas courses for the current user."""

    serializer_class = CanvasCourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return only courses belonging to the authenticated user."""
        return CanvasCourse.objects.filter(user=self.request.user).order_by("name")


class CanvasAssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to synchronized Canvas assignments for the current user."""

    serializer_class = CanvasAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return only assignments from courses owned by the authenticated user."""
        return CanvasAssignment.objects.filter(
            course__user=self.request.user
        ).select_related("course").order_by("due_date", "name")


class CanvasGradeViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to synchronized Canvas grades for the current user."""

    serializer_class = CanvasGradeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return only grades belonging to the authenticated user."""
        return CanvasGrade.objects.filter(user=self.request.user).select_related(
            "assignment",
            "assignment__course",
        ).order_by("-graded_at", "-updated_at")

