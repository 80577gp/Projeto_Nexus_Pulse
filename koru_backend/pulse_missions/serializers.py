"""
Serializers for the pulse_missions app.

This module defines DRF serializers for missions, completions, effort rankings,
and grade correlation records.
"""

from rest_framework import serializers

from .models import EffortRanking, GradeCorrelation, Mission, MissionCompletion


class MissionSerializer(serializers.ModelSerializer):
    """
    Serializer for student missions.

    The authenticated user is automatically used as the mission owner.
    """

    student = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Mission
        fields = "__all__"


class MissionCompletionSerializer(serializers.ModelSerializer):
    """
    Serializer for mission completion events.

    A hidden helper field captures the authenticated user so views can validate
    mission ownership without exposing a student field in the API payload.
    """

    student = serializers.HiddenField(
        default=serializers.CurrentUserDefault(),
        write_only=True,
    )

    class Meta:
        model = MissionCompletion
        fields = ["student", "mission", "completed_at", "notes"]
        read_only_fields = ["completed_at"]

    def validate(self, attrs):
        """Ensure the selected mission belongs to the authenticated user."""
        student = attrs.get("student")
        mission = attrs.get("mission")

        if mission and student and mission.student != student:
            raise serializers.ValidationError(
                {"mission": "You can only complete your own missions."}
            )
        return attrs

    def create(self, validated_data):
        """Drop the helper student field before persisting the completion."""
        validated_data.pop("student", None)
        return super().create(validated_data)


class EffortRankingSerializer(serializers.ModelSerializer):
    """
    Serializer for weekly effort ranking data.

    The authenticated user is automatically bound to the ranking record, and
    `last_updated` is exposed as an alias for the model's `updated_at` field.
    """

    student = serializers.HiddenField(default=serializers.CurrentUserDefault())
    last_updated = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = EffortRanking
        fields = ["student", "weekly_score", "ranking_position", "last_updated"]


class GradeCorrelationSerializer(serializers.ModelSerializer):
    """
    Serializer for effort-versus-grade correlation data.

    The authenticated user is automatically attached to each record. The
    `missions_completed` field is exposed as an API-friendly alias for the
    stored `effort_score` value because the current model does not yet contain a
    dedicated mission-count field.
    """

    student = serializers.HiddenField(default=serializers.CurrentUserDefault())
    missions_completed = serializers.DecimalField(
        source="effort_score",
        max_digits=8,
        decimal_places=2,
    )

    class Meta:
        model = GradeCorrelation
        fields = [
            "student",
            "external_reference",
            "missions_completed",
            "grade_score",
            "correlation_note",
            "created_at",
        ]
        read_only_fields = ["created_at"]
