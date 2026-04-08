"""URL router for the KORU foundation app."""

from rest_framework.routers import DefaultRouter

from .views import (
    CourseViewSet,
    CutoffScoreViewSet,
    SubjectViewSet,
    TopicPrerequisiteViewSet,
    TopicViewSet,
    UniversityViewSet,
)


router = DefaultRouter()
router.register("universities", UniversityViewSet, basename="foundation-university")
router.register("courses", CourseViewSet, basename="foundation-course")
router.register("cutoff-scores", CutoffScoreViewSet, basename="foundation-cutoff-score")
router.register("subjects", SubjectViewSet, basename="foundation-subject")
router.register("topics", TopicViewSet, basename="foundation-topic")
router.register("topic-prerequisites", TopicPrerequisiteViewSet, basename="foundation-topic-prerequisite")

urlpatterns = router.urls
