"""
Models for the notifications app.
"""

from django.conf import settings
from django.db import models


class Notification(models.Model):
    """Represents a user-facing notification inside the platform."""

    TYPE_GENERAL = "general"
    TYPE_MISSION_REMINDER = "mission_reminder"
    TYPE_BEREAL_PROMPT = "bereal_prompt"

    TYPE_CHOICES = (
        (TYPE_GENERAL, "General"),
        (TYPE_MISSION_REMINDER, "Mission Reminder"),
        (TYPE_BEREAL_PROMPT, "BeReal Prompt"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default=TYPE_GENERAL)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        """Return a concise label for the notification."""
        return f"{self.title} - {self.user.email}"


class BeRealMoment(models.Model):
    """Stores a BeReal-style post created by a user."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bereal_moments",
    )
    front_image = models.ImageField(upload_to="bereal/front/")
    back_image = models.ImageField(upload_to="bereal/back/")
    caption = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        """Return a concise label for the BeReal moment."""
        return f"BeReal Moment - {self.user.email}"

