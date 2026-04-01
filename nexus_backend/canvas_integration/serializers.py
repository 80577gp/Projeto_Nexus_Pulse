"""
Serializers for the canvas_integration app.

This module defines DRF serializers for Canvas OAuth integration data and synced
Canvas academic resources.
"""

from rest_framework import serializers

from .models import CanvasAssignment, CanvasCourse, CanvasGrade, CanvasIntegration


class CanvasIntegrationSerializer(serializers.ModelSerializer):
    """
    Serializer for a user's Canvas OAuth integration.

    Exposes the token fields needed to store and refresh the Canvas connection.
    """

    expires_at = serializers.DateTimeField(source="token_expires_at", required=False)

    class Meta:
        model = CanvasIntegration
        fields = [
            "id",
            "user",
            "access_token",
            "refresh_token",
            "expires_at",
            "canvas_user_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class CanvasCourseSerializer(serializers.ModelSerializer):
    """Serializer for synchronized Canvas courses."""

    class Meta:
        model = CanvasCourse
        fields = "__all__"


class CanvasAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for synchronized Canvas assignments."""

    class Meta:
        model = CanvasAssignment
        fields = "__all__"


class CanvasGradeSerializer(serializers.ModelSerializer):
    """Serializer for synchronized Canvas grades."""

    class Meta:
        model = CanvasGrade
        fields = "__all__"

