"""ViewSets for KORU foundation data."""

from decimal import Decimal

from django.db.models import Avg
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from diagnostics.models import StudentProgress

from .models import Course, CutoffScore, Subject, Topic, TopicPrerequisite, University
from .serializers import (
    CourseSerializer,
    CutoffScoreSerializer,
    SubjectSerializer,
    TopicPrerequisiteSerializer,
    TopicSerializer,
    UniversitySerializer,
)


MASTERY_GATE_THRESHOLD = Decimal("70.00")


def _resolve_topic_mastery(*, student, topic: Topic):
    """Approximate topic readiness from skill-level mastery snapshots."""
    aggregated = (
        StudentProgress.objects.filter(
            student=student,
            skill__topic__name__iexact=topic.name,
            skill__topic__subject__name__iexact=topic.subject.name,
        )
        .aggregate(average_mastery=Avg("mastery_level"))
    )

    average_mastery = aggregated["average_mastery"]
    return Decimal(str(average_mastery)) if average_mastery is not None else None


def _build_prerequisite_gate_report(*, student, topic: Topic):
    """Return recursive prerequisite readiness for the requested topic."""
    prerequisite_topics = Topic.objects.prerequisite_closure(topic.id)
    blocked_by = []

    for prerequisite in prerequisite_topics:
        mastery = _resolve_topic_mastery(student=student, topic=prerequisite)
        is_blocked = mastery is None or mastery < MASTERY_GATE_THRESHOLD
        if is_blocked:
            blocked_by.append(
                {
                    "id": prerequisite.id,
                    "name": prerequisite.name,
                    "subject": prerequisite.subject.name,
                    "mastery_level": float(mastery) if mastery is not None else None,
                    "threshold": float(MASTERY_GATE_THRESHOLD),
                }
            )

    return {
        "topic_id": topic.id,
        "topic_name": topic.name,
        "threshold": float(MASTERY_GATE_THRESHOLD),
        "is_unlocked": not blocked_by,
        "blocked_by": blocked_by,
        "prerequisite_count": len(prerequisite_topics),
    }


class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.prefetch_related("courses__cutoff_scores").all()
    serializer_class = UniversitySerializer
    permission_classes = [IsAuthenticated]


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related("university").prefetch_related("cutoff_scores").all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]


class CutoffScoreViewSet(viewsets.ModelViewSet):
    queryset = CutoffScore.objects.select_related("course", "course__university").all()
    serializer_class = CutoffScoreSerializer
    permission_classes = [IsAuthenticated]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.prefetch_related("topics__prerequisites", "topics__unlocks").all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]


class TopicViewSet(viewsets.ModelViewSet):
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Topic.objects.get_queryset()
        subject_id = self.request.query_params.get("subject")
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        return queryset

    @action(detail=True, methods=["get"])
    def prerequisite_closure(self, request, pk=None):
        topic = self.get_object()
        closure = Topic.objects.prerequisite_closure(topic.id)
        return Response(TopicSerializer(closure, many=True).data)

    @action(detail=True, methods=["get"])
    def readiness(self, request, pk=None):
        """Report whether recursive prerequisites are strong enough to unlock this topic."""
        topic = self.get_object()
        gate_report = _build_prerequisite_gate_report(student=request.user, topic=topic)
        response_status = status.HTTP_200_OK if gate_report["is_unlocked"] else status.HTTP_423_LOCKED
        return Response(gate_report, status=response_status)


class TopicPrerequisiteViewSet(viewsets.ModelViewSet):
    queryset = TopicPrerequisite.objects.select_related(
        "topic",
        "topic__subject",
        "prerequisite",
        "prerequisite__subject",
    ).all()
    serializer_class = TopicPrerequisiteSerializer
    permission_classes = [IsAuthenticated]
