"""
Views for the diagnostics app.

This module exposes admin CRUD endpoints for diagnostic tests and related
resources, plus authenticated student endpoints for answering tests and checking
progress.
"""

from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import Choice, DiagnosticTest, Question, StudentProgress
from .serializers import (
    ChoiceSerializer,
    DiagnosticTestSerializer,
    QuestionSerializer,
    StudentAnswerSerializer,
    StudentProgressSerializer,
)


class DiagnosticTestViewSet(viewsets.ModelViewSet):
    """
    Admin-only ViewSet for managing diagnostic tests.

    A custom action is also provided so an authenticated user can request the
    payload needed to start a diagnostic test.
    """

    queryset = DiagnosticTest.objects.prefetch_related("questions__choices").all()
    serializer_class = DiagnosticTestSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def submit_test(self, request):
        """
        Submit or initiate a diagnostic test request for the authenticated user.

        Expects `test_id` in the request body and returns the serialized test
        with nested questions and choices.
        """

        test_id = request.data.get("test_id")
        if not test_id:
            return Response(
                {"detail": "The 'test_id' field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            diagnostic_test = self.get_queryset().get(id=test_id)
        except DiagnosticTest.DoesNotExist:
            return Response(
                {"detail": "Diagnostic test not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(diagnostic_test)
        return Response(serializer.data, status=status.HTTP_200_OK)


class QuestionViewSet(viewsets.ModelViewSet):
    """Admin-only ViewSet for managing diagnostic questions."""

    queryset = Question.objects.prefetch_related("choices").all().order_by("test", "order", "id")
    serializer_class = QuestionSerializer
    permission_classes = [IsAdminUser]


class ChoiceViewSet(viewsets.ModelViewSet):
    """Admin-only ViewSet for managing question choices."""

    queryset = Choice.objects.select_related("question", "question__test").all()
    serializer_class = ChoiceSerializer
    permission_classes = [IsAdminUser]


class StudentAnswerCreateView(generics.CreateAPIView):
    """
    Authenticated endpoint for submitting a student's answer.

    The student is always taken from the authenticated request user.
    """

    serializer_class = StudentAnswerSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Save the answer for the authenticated student."""
        serializer.save(student=self.request.user)


class StudentProgressViewSet(viewsets.ModelViewSet):
    """
    Authenticated ViewSet for student progress.

    Regular users only see their own progress, while admins can access all
    records.
    """

    serializer_class = StudentProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Restrict non-admin users to their own progress entries."""
        queryset = StudentProgress.objects.select_related("student", "skill").all()
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(student=self.request.user)
