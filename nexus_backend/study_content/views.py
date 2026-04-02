"""
Views for the study_content app.

This module exposes CRUD endpoints for the educational content hierarchy using
DRF ModelViewSets.
"""

from nexus_backend.filter_backends import DjangoFilterBackend
from rest_framework.permissions import IsAdminUser, IsAuthenticatedOrReadOnly
from rest_framework.viewsets import ModelViewSet

from .models import Content, SchoolYear, Skill, Subject, Topic
from .serializers import (
    ContentSerializer,
    SchoolYearSerializer,
    SkillSerializer,
    SubjectSerializer,
    TopicSerializer,
)


class AdminWriteReadOnlyViewSet(ModelViewSet):
    """
    Base viewset with dynamic permissions.

    Safe methods such as GET, HEAD, and OPTIONS are allowed with
    IsAuthenticatedOrReadOnly, while write operations are restricted to admins.
    """

    filter_backends = [DjangoFilterBackend]

    def get_permissions(self):
        """Return permissions based on the current action."""
        if self.action in ["list", "retrieve"]:
            permission_classes = [IsAuthenticatedOrReadOnly]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]


class SchoolYearViewSet(AdminWriteReadOnlyViewSet):
    """ViewSet for listing, retrieving, creating, updating, and deleting school years."""

    queryset = SchoolYear.objects.all().order_by("name")
    serializer_class = SchoolYearSerializer
    filterset_fields = ["name"]


class SubjectViewSet(AdminWriteReadOnlyViewSet):
    """ViewSet for managing subjects."""

    queryset = Subject.objects.select_related("school_year").all().order_by("name")
    serializer_class = SubjectSerializer
    filterset_fields = ["school_year"]

    def get_queryset(self):
        """Allow filtering by school year even when django-filter is unavailable."""
        queryset = super().get_queryset()
        school_year = self.request.query_params.get("school_year")
        if school_year:
            queryset = queryset.filter(school_year=school_year)
        return queryset


class TopicViewSet(AdminWriteReadOnlyViewSet):
    """ViewSet for managing topics."""

    queryset = Topic.objects.select_related("subject", "subject__school_year").all().order_by("name")
    serializer_class = TopicSerializer
    filterset_fields = ["subject"]

    def get_queryset(self):
        """Allow query-parameter filtering by subject."""
        queryset = super().get_queryset()
        subject = self.request.query_params.get("subject")
        if subject:
            queryset = queryset.filter(subject=subject)
        return queryset


class SkillViewSet(AdminWriteReadOnlyViewSet):
    """ViewSet for managing skills."""

    queryset = Skill.objects.select_related(
        "topic",
        "topic__subject",
        "topic__subject__school_year",
    ).all().order_by("name")
    serializer_class = SkillSerializer
    filterset_fields = ["topic"]

    def get_queryset(self):
        """Allow query-parameter filtering by topic."""
        queryset = super().get_queryset()
        topic = self.request.query_params.get("topic")
        if topic:
            queryset = queryset.filter(topic=topic)
        return queryset


class ContentViewSet(AdminWriteReadOnlyViewSet):
    """ViewSet for managing educational content items."""

    queryset = Content.objects.select_related(
        "skill",
        "skill__topic",
        "skill__topic__subject",
        "skill__topic__subject__school_year",
    ).all().order_by("title")
    serializer_class = ContentSerializer
    filterset_fields = ["skill", "content_type"]

    def get_queryset(self):
        """Allow query-parameter filtering by skill and content type."""
        queryset = super().get_queryset()
        skill = self.request.query_params.get("skill")
        content_type = self.request.query_params.get("content_type")
        if skill:
            queryset = queryset.filter(skill=skill)
        if content_type:
            queryset = queryset.filter(content_type=content_type)
        return queryset
