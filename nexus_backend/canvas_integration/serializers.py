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

    Token fields are accepted on write but never exposed in serializer output.
    The Canvas user identifier is required so the local integration can be
    linked to the corresponding account in Canvas.
    """

    access_token = serializers.CharField(write_only=True)
    refresh_token = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        allow_null=True,
    )
    expires_at = serializers.DateTimeField(
        source="token_expires_at",
        required=False,
        allow_null=True,
    )

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

    def validate(self, attrs):
        """Ensure the Canvas account identifier is always provided."""
        canvas_user_id = attrs.get("canvas_user_id")
        if not canvas_user_id:
            raise serializers.ValidationError(
                {"canvas_user_id": "This field is required."}
            )
        return attrs


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
