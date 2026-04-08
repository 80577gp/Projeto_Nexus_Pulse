"""
URL configuration for the pulse_missions app.

This module registers the mission-related ViewSets and exposes the explicit
endpoint for mission completion creation.
"""

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    EffortRankingViewSet,
    GradeCorrelationViewSet,
    MissionCompletionCreateView,
    MissionViewSet,
)


# Router responsible for generating CRUD routes for mission resources.
router = DefaultRouter()
router.register("missions", MissionViewSet, basename="mission")
router.register("effort-rankings", EffortRankingViewSet, basename="effort-ranking")
router.register(
    "grade-correlations",
    GradeCorrelationViewSet,
    basename="grade-correlation",
)


urlpatterns = [
    # Explicit endpoint used to create a mission completion record.
    path(
        "mission-completions/create/",
        MissionCompletionCreateView.as_view(),
        name="mission-completion-create",
    ),
]


# Router-generated routes for missions, rankings, and correlations.
urlpatterns += router.urls

