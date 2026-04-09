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

    queryset = DiagnosticTest.objects.select_related(
        "related_skill",
        "related_skill__topic",
        "related_skill__topic__subject",
    ).prefetch_related(
        "questions__choices",
    ).all()
    serializer_class = DiagnosticTestSerializer

    def get_permissions(self):
        """Allow authenticated users to read tests while restricting writes to admins."""
        if self.action in ["list", "retrieve", "submit_test"]:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Support filtering tests by subject through the related skill hierarchy."""
        queryset = super().get_queryset()
        subject_id = self.request.query_params.get("subject")
        if subject_id:
            queryset = queryset.filter(related_skill__topic__subject_id=subject_id)
        return queryset

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
        chosen_choice = serializer.validated_data.get("chosen_choice")
        text_answer = (serializer.validated_data.get("text_answer") or "").strip()
        is_correct = bool(chosen_choice and chosen_choice.is_correct)

        if not chosen_choice and text_answer:
            question = serializer.validated_data["question"]
            normalized_submission = text_answer.casefold()
            accepted_answers = [
                choice.text.strip().casefold()
                for choice in question.choices.filter(is_correct=True)
                if choice.text.strip()
            ]
            is_correct = normalized_submission in accepted_answers

        serializer.save(student=self.request.user, is_correct=is_correct)


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
        queryset = StudentProgress.objects.select_related(
            "student",
            "skill",
            "skill__topic",
            "skill__topic__subject",
        ).all()
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(student=self.request.user)
