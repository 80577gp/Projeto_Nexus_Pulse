"""
Models for the canvas_integration app.

This module stores Canvas LMS OAuth credentials and synchronized academic data
such as courses, assignments, and grades.
"""

from django.conf import settings
from django.db import models


class CanvasIntegration(models.Model):
    """Stores the Canvas OAuth connection for a single user."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="canvas_integration",
        help_text="User who owns this Canvas integration.",
    )
    access_token = models.TextField(
        help_text="OAuth access token used to call the Canvas API.",
    )
    refresh_token = models.TextField(
        blank=True,
        null=True,
        help_text="OAuth refresh token used to renew access when available.",
    )
    canvas_user_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Identifier of the user in Canvas.",
    )
    token_expires_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Expiration timestamp for the current access token.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Return a descriptive representation of the integration."""
        return f"Canvas Integration - {self.user.email}"


class CanvasCourse(models.Model):
    """Represents a Canvas course synchronized for a user."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="canvas_courses",
        help_text="User to whom this Canvas course is linked.",
    )
    canvas_course_id = models.CharField(
        max_length=100,
        unique=True,
        help_text="Course identifier from Canvas.",
    )
    name = models.CharField(
        max_length=255,
        help_text="Display name of the Canvas course.",
    )
    course_code = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Short code for the Canvas course.",
    )
    enrollment_state = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Enrollment state of the user in this course.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Return a descriptive representation of the course."""
        return self.name


class CanvasAssignment(models.Model):
    """Represents an assignment synchronized from a Canvas course."""

    course = models.ForeignKey(
        CanvasCourse,
        on_delete=models.CASCADE,
        related_name="assignments",
        help_text="Canvas course to which this assignment belongs.",
    )
    canvas_assignment_id = models.CharField(
        max_length=100,
        unique=True,
        help_text="Assignment identifier from Canvas.",
    )
    name = models.CharField(
        max_length=255,
        help_text="Name of the assignment.",
    )
    description = models.TextField(
        blank=True,
        help_text="Assignment description as provided by Canvas.",
    )
    due_date = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Due date of the assignment in Canvas.",
    )
    points_possible = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Maximum score possible for the assignment.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Return a descriptive representation of the assignment."""
        return f"{self.name} - {self.course.name}"


class CanvasGrade(models.Model):
    """Represents a user's grade for a synchronized Canvas assignment."""

    assignment = models.ForeignKey(
        CanvasAssignment,
        on_delete=models.CASCADE,
        related_name="grades",
        help_text="Assignment to which this grade belongs.",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="canvas_grades",
        help_text="User who received this grade.",
    )
    score = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Numeric score received for the assignment.",
    )
    grade = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Letter or textual grade returned by Canvas.",
    )
    submitted_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Submission timestamp recorded by Canvas.",
    )
    graded_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Timestamp when the assignment was graded.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("assignment", "user")

    def __str__(self):
        """Return a descriptive representation of the grade."""
        return f"{self.user.email} - {self.assignment.name}"

