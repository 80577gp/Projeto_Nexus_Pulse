"""ViewSets for KORU foundation data."""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Course, CutoffScore, Subject, Topic, TopicPrerequisite, University
from .serializers import (
    CourseSerializer,
    CutoffScoreSerializer,
    SubjectSerializer,
    TopicPrerequisiteSerializer,
    TopicSerializer,
    UniversitySerializer,
)


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


class TopicPrerequisiteViewSet(viewsets.ModelViewSet):
    queryset = TopicPrerequisite.objects.select_related(
        "topic",
        "topic__subject",
        "prerequisite",
        "prerequisite__subject",
    ).all()
    serializer_class = TopicPrerequisiteSerializer
    permission_classes = [IsAuthenticated]
