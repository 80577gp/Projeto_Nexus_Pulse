"""
URL configuration for the canvas_integration app.

This module defines OAuth2 endpoints for Canvas and registers read-only
ViewSets for synchronized Canvas resources.
"""

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CanvasAssignmentViewSet,
    CanvasCourseViewSet,
    CanvasGradeViewSet,
    CanvasOAuth2CallbackView,
    CanvasOAuth2InitiateView,
)


# Router responsible for generating read-only routes for Canvas resources.
router = DefaultRouter()
router.register("courses", CanvasCourseViewSet, basename="canvas-course")
router.register("assignments", CanvasAssignmentViewSet, basename="canvas-assignment")
router.register("grades", CanvasGradeViewSet, basename="canvas-grade")


urlpatterns = [
    # Starts the Canvas OAuth2 authorization flow.
    path(
        "oauth/initiate/",
        CanvasOAuth2InitiateView.as_view(),
        name="canvas-oauth-initiate",
    ),

    # Receives the redirect from Canvas after user authorization.
    path(
        "oauth/callback/",
        CanvasOAuth2CallbackView.as_view(),
        name="canvas-oauth-callback",
    ),
]


# Router-generated routes for synchronized Canvas data.
urlpatterns += router.urls

