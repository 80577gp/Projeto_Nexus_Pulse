"""
URL configuration for the study_content app.

This module registers the app ViewSets using DRF's DefaultRouter so the project
can expose standard RESTful routes automatically.
"""

from rest_framework.routers import DefaultRouter

from .views import (
    ContentViewSet,
    SchoolYearViewSet,
    SkillViewSet,
    SubjectViewSet,
    TopicViewSet,
)


# Router responsible for generating CRUD routes for each educational resource.
router = DefaultRouter()
router.register("schoolyears", SchoolYearViewSet, basename="schoolyear")
router.register("subjects", SubjectViewSet, basename="subject")
router.register("topics", TopicViewSet, basename="topic")
router.register("skills", SkillViewSet, basename="skill")
router.register("contents", ContentViewSet, basename="content")


# The router automatically creates urlpatterns for all registered ViewSets.
urlpatterns = router.urls

