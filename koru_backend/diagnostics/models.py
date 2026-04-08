"""
Models for the diagnostics app.

This module defines the diagnostic testing structure, including tests,
questions, answer choices, student answers, and student progress tracking.
"""

from django.conf import settings
from django.db import models

from study_content.models import Skill


class DiagnosticTest(models.Model):
    """Represents a diagnostic test associated with a specific skill."""

    name = models.CharField(
        max_length=150,
        help_text="Name of the diagnostic test.",
    )
    description = models.TextField(
        blank=True,
        help_text="Short description explaining the purpose of the test.",
    )
    version = models.PositiveIntegerField(
        default=1,
        help_text="Version number used to preserve diagnostic test evolution.",
    )
    bkt_skill_key = models.CharField(
        max_length=160,
        blank=True,
        help_text="Stable identifier consumed by the BKT engine and graph layer.",
    )
    related_skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="diagnostic_tests",
        help_text="Skill evaluated by this diagnostic test.",
    )

    def __str__(self):
        """Return a descriptive name for the test."""
        return f"{self.name} - {self.related_skill.name}"


class Question(models.Model):
    """Represents a question that belongs to a diagnostic test."""

    test = models.ForeignKey(
        DiagnosticTest,
        on_delete=models.CASCADE,
        related_name="questions",
        help_text="Diagnostic test to which this question belongs.",
    )
    text = models.TextField(
        help_text="Statement or prompt shown to the student.",
    )
    question_type = models.CharField(
        max_length=30,
        default="multiple_choice",
        help_text="Type of question, for example multiple_choice or open_text.",
    )
    order = models.PositiveIntegerField(
        default=1,
        help_text="Display order of the question inside the test.",
    )

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        """Return a descriptive name for the question."""
        return f"Question {self.order} - {self.test.name}"


class Choice(models.Model):
    """Represents an answer option for a question."""

    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="choices",
        help_text="Question to which this choice belongs.",
    )
    text = models.CharField(
        max_length=255,
        help_text="Text displayed for this answer choice.",
    )
    is_correct = models.BooleanField(
        default=False,
        help_text="Indicates whether this is the correct answer.",
    )

    def __str__(self):
        """Return a descriptive name for the choice."""
        return f"Choice for {self.question}"


class StudentAnswer(models.Model):
    """Represents a student's selected answer for a diagnostic question."""

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="diagnostic_answers",
        help_text="Student who answered the question.",
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="student_answers",
        help_text="Question answered by the student.",
    )
    chosen_choice = models.ForeignKey(
        Choice,
        on_delete=models.CASCADE,
        related_name="student_answers",
        blank=True,
        null=True,
        help_text="Choice selected by the student.",
    )
    text_answer = models.TextField(
        blank=True,
        null=True,
        help_text="Free-text answer submitted by the student when applicable.",
    )
    is_correct = models.BooleanField(
        default=False,
        help_text="Stores whether the student's answer was correct.",
    )
    answered_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the answer was submitted.",
    )

    def __str__(self):
        """Return a descriptive name for the student's answer."""
        return f"{self.student.email} - {self.question}"


class StudentProgress(models.Model):
    """Tracks a student's performance and progress for a skill."""

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="skill_progress",
        help_text="Student whose progress is being tracked.",
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="student_progress",
        help_text="Skill for which progress is being recorded.",
    )
    mastery_level = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        help_text="Current score or mastery value for the student in this skill.",
    )
    completed = models.BooleanField(
        default=False,
        help_text="Indicates whether the student completed the diagnostic flow.",
    )
    last_evaluated = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp of the latest progress evaluation.",
    )

    class Meta:
        unique_together = ("student", "skill")

    def __str__(self):
        """Return a descriptive name for the student's progress entry."""
        return f"{self.student.email} - {self.skill.name}"
