"""
Models for the pulse_missions app.

This module defines mission tracking, completion history, weekly effort
rankings, and grade correlation records for students.
"""

from django.conf import settings
from django.db import models

from canvas_integration.models import CanvasAssignment


class Mission(models.Model):
    """Represents a mission assigned to a student, optionally linked to Canvas."""

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="missions",
        help_text="Student responsible for this mission.",
    )
    canvas_assignment = models.ForeignKey(
        CanvasAssignment,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="missions",
        help_text="Related Canvas assignment, when the mission came from Canvas.",
    )
    title = models.CharField(
        max_length=255,
        help_text="Short title of the mission.",
    )
    description = models.TextField(
        blank=True,
        help_text="Detailed explanation of what the student should do.",
    )
    due_date = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Deadline for completing the mission.",
    )
    status = models.CharField(
        max_length=20,
        default="pending",
        help_text="Current mission status, for example pending or completed.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """Return a descriptive representation of the mission."""
        return f"{self.title} - {self.student.email}"


class MissionCompletion(models.Model):
    """Stores the completion event for a mission."""

    mission = models.ForeignKey(
        Mission,
        on_delete=models.CASCADE,
        related_name="completions",
        help_text="Mission that was completed.",
    )
    completed_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the mission was completed.",
    )
    notes = models.TextField(
        blank=True,
        help_text="Optional notes about the mission completion.",
    )

    def __str__(self):
        """Return a descriptive representation of the completion record."""
        return f"Completion - {self.mission.title}"


class EffortRanking(models.Model):
    """Tracks a student's weekly effort score and ranking position."""

    student = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="effort_ranking",
        help_text="Student whose effort ranking is being tracked.",
    )
    weekly_score = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text="Weekly score representing the student's effort.",
    )
    ranking_position = models.PositiveIntegerField(
        default=0,
        help_text="Position of the student in the weekly ranking.",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp of the latest ranking update.",
    )

    def __str__(self):
        """Return a descriptive representation of the effort ranking."""
        return f"{self.student.email} - Rank {self.ranking_position}"


class GradeCorrelation(models.Model):
    """Relates a mission or assignment effort to the student's grade outcome."""

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="grade_correlations",
        help_text="Student linked to this grade correlation record.",
    )
    canvas_assignment = models.ForeignKey(
        CanvasAssignment,
        on_delete=models.CASCADE,
        related_name="grade_correlations",
        help_text="Canvas assignment used for the grade correlation analysis.",
    )
    effort_score = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text="Effort score associated with the student's work.",
    )
    grade_score = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text="Grade score obtained for the assignment.",
    )
    correlation_note = models.TextField(
        blank=True,
        help_text="Optional note about the observed effort/grade relationship.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """Return a descriptive representation of the grade correlation."""
        return f"{self.student.email} - {self.canvas_assignment.name}"

