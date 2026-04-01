"""
URL configuration for the diagnostics app.

This module registers the diagnostic ViewSets using DRF's DefaultRouter so the
project exposes standard CRUD endpoints automatically.
Custom actions declared on the ViewSets, such as `submit_test`, are also made
available through the generated routes.
"""

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ChoiceViewSet,
    DiagnosticTestViewSet,
    QuestionViewSet,
    StudentAnswerCreateView,
    StudentProgressViewSet,
)


# Router responsible for generating RESTful routes for diagnostic resources.
router = DefaultRouter()
router.register("diagnostic-tests", DiagnosticTestViewSet, basename="diagnostic-test")
router.register("questions", QuestionViewSet, basename="question")
router.register("choices", ChoiceViewSet, basename="choice")
router.register("student-progress", StudentProgressViewSet, basename="student-progress")


urlpatterns = [
    # Authenticated endpoint used by a student to submit an answer.
    path(
        "student-answers/",
        StudentAnswerCreateView.as_view(),
        name="student-answer-create",
    ),
]


# The router appends CRUD routes and custom ViewSet actions such as:
# POST /diagnostic-tests/submit_test/
urlpatterns += router.urls

