"""
Serializers for the diagnostics app.

This module defines the serializers used to expose diagnostic tests, questions,
choices, student answers, and student progress through the API.
"""

from rest_framework import serializers

from .models import Choice, DiagnosticTest, Question, StudentAnswer, StudentProgress


class ChoiceSerializer(serializers.ModelSerializer):
    """Serializer for answer choices associated with a question."""

    class Meta:
        model = Choice
        fields = ["id", "text", "is_correct"]


class QuestionSerializer(serializers.ModelSerializer):
    """
    Serializer for diagnostic questions.

    Includes nested choices so clients can consume the complete question payload
    in a single response.
    """

    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["id", "test", "text", "question_type", "choices"]


class DiagnosticTestSerializer(serializers.ModelSerializer):
    """
    Serializer for diagnostic tests.

    Includes the related skill and the nested list of questions.
    """

    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = DiagnosticTest
        fields = ["id", "name", "description", "related_skill", "questions"]


class StudentAnswerSerializer(serializers.ModelSerializer):
    """Serializer for answers submitted by students during diagnostics."""

    def validate(self, attrs):
        """Ensure the chosen choice belongs to the selected question."""
        question = attrs.get("question")
        chosen_choice = attrs.get("chosen_choice")
        text_answer = attrs.get("text_answer")

        if not chosen_choice and not text_answer:
            raise serializers.ValidationError(
                "Either 'chosen_choice' or 'text_answer' must be provided."
            )

        if chosen_choice and question and chosen_choice.question_id != question.id:
            raise serializers.ValidationError(
                {"chosen_choice": "This choice does not belong to the selected question."}
            )

        return attrs

    class Meta:
        model = StudentAnswer
        fields = ["id", "question", "chosen_choice", "text_answer", "is_correct"]
        read_only_fields = ["is_correct"]


class StudentProgressSerializer(serializers.ModelSerializer):
    """Serializer for a student's progress in a given skill."""

    class Meta:
        model = StudentProgress
        fields = ["id", "skill", "mastery_level", "last_evaluated"]
        read_only_fields = ["last_evaluated"]
