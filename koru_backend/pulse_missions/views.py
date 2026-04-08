"""
Views for the pulse_missions app.

This module exposes endpoints for student missions, effort rankings, grade
correlations, and mission completion records.
"""

from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import EffortRanking, GradeCorrelation, Mission
from .serializers import (
    EffortRankingSerializer,
    GradeCorrelationSerializer,
    MissionCompletionSerializer,
    MissionSerializer,
)


class MissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for missions belonging to the authenticated user.

    Admin users can access all missions, while regular users are restricted to
    their own records.
    """

    serializer_class = MissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return missions visible to the current user."""
        queryset = Mission.objects.select_related("student").prefetch_related("completions").all().order_by("-created_at")
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(student=self.request.user)

    def perform_create(self, serializer):
        """Attach the authenticated user when a non-admin creates a mission."""
        if self.request.user.is_staff and serializer.validated_data.get("student"):
            serializer.save()
            return
        serializer.save(student=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        """
        Create a completion record for the selected mission.

        This action also updates the mission status to `completed`.
        """

        mission = self.get_object()
        serializer = MissionCompletionSerializer(
            data={"mission": mission.id, "notes": request.data.get("notes", "")},
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        completion = serializer.save()

        mission.status = "completed"
        mission.save(update_fields=["status"])

        return Response(
            {
                "message": "Mission marked as completed.",
                "completion_id": completion.id,
                "mission_id": mission.id,
                "status": mission.status,
            },
            status=status.HTTP_201_CREATED,
        )


class MissionCompletionCreateView(generics.CreateAPIView):
    """
    Endpoint for manually creating a mission completion record.

    The authenticated user can only create completion records for their own
    missions unless they are an admin.
    """

    serializer_class = MissionCompletionSerializer
    permission_classes = [IsAuthenticated]


class EffortRankingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for weekly effort rankings.

    Users see their own ranking data, while admins can manage all records.
    """

    serializer_class = EffortRankingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return ranking records visible to the current user."""
        queryset = EffortRanking.objects.select_related("student").all().order_by(
            "ranking_position",
            "-weekly_score",
        )
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(student=self.request.user)


class GradeCorrelationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for grade correlation entries.

    Users only see their own correlation data, while admins can access all
    records.
    """

    serializer_class = GradeCorrelationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return grade correlation records visible to the current user."""
        queryset = GradeCorrelation.objects.select_related("student").all().order_by("-created_at")
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(student=self.request.user)
