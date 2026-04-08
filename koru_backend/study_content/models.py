"""
Models for the study_content app.

This module organizes educational content by school year, subject, topic, and
skill, allowing each content item to be linked to a specific learning context.
"""

import hashlib

from django.db import models

try:
    from pgvector.django import VectorField as PGVectorField
except ImportError:
    class PGVectorField(models.JSONField):
        """Fallback field used when pgvector is unavailable in local environments."""

        def __init__(self, *args, dimensions=None, **kwargs):
            self.dimensions = dimensions
            super().__init__(*args, **kwargs)


class SchoolYear(models.Model):
    """Represents a school year or grade level."""

    name = models.CharField(
        max_length=50,
        unique=True,
        help_text="Name of the school year, for example '9o Ano' or '1a Serie EM'.",
    )

    def __str__(self):
        """Return the school year name."""
        return self.name


class Subject(models.Model):
    """Represents a school subject within a given school year."""

    name = models.CharField(
        max_length=100,
        help_text="Name of the subject, for example Mathematics or History.",
    )
    school_year = models.ForeignKey(
        SchoolYear,
        on_delete=models.CASCADE,
        related_name="subjects",
        help_text="School year to which this subject belongs.",
    )

    def __str__(self):
        """Return a descriptive subject label."""
        return f"{self.name} - {self.school_year.name}"


class Topic(models.Model):
    """Represents a topic inside a subject."""

    name = models.CharField(
        max_length=150,
        help_text="Name of the topic covered within the subject.",
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="topics",
        help_text="Subject to which this topic belongs.",
    )

    def __str__(self):
        """Return a descriptive topic label."""
        return f"{self.name} - {self.subject.name}"


class Skill(models.Model):
    """Represents a skill or competency tied to a topic."""

    name = models.CharField(
        max_length=150,
        help_text="Name of the skill developed in this topic.",
    )
    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name="skills",
        help_text="Topic to which this skill belongs.",
    )

    def __str__(self):
        """Return a descriptive skill label."""
        return f"{self.name} - {self.topic.name}"


class Content(models.Model):
    """Represents a study material associated with a specific skill."""

    TYPE_VIDEO = "video"
    TYPE_TEXT = "text"
    TYPE_PDF = "pdf"
    TYPE_EXERCISE = "exercise"

    CONTENT_TYPE_CHOICES = (
        (TYPE_VIDEO, "Video"),
        (TYPE_TEXT, "Text"),
        (TYPE_PDF, "PDF"),
        (TYPE_EXERCISE, "Exercise"),
    )

    title = models.CharField(
        max_length=200,
        help_text="Title of the content item.",
    )
    description = models.TextField(
        help_text="Short description or summary of the content.",
    )
    content_type = models.CharField(
        max_length=20,
        choices=CONTENT_TYPE_CHOICES,
        help_text="Type of educational content.",
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="contents",
        help_text="Skill to which this content item is related.",
    )
    semantic_embedding = PGVectorField(
        dimensions=1536,
        blank=True,
        null=True,
        help_text="Embedding used for semantic retrieval in the RAIZ RAG layer.",
    )
    semantic_source_hash = models.CharField(
        max_length=64,
        blank=True,
        help_text="Stable hash of the content payload used to detect stale embeddings.",
    )

    def __str__(self):
        """Return a descriptive content label."""
        return f"{self.title} ({self.get_content_type_display()})"

    def save(self, *args, **kwargs):
        """Persist a stable content hash so semantic pipelines can detect changes."""
        base_payload = f"{self.title}|{self.description}|{self.content_type}|{self.skill_id}"
        self.semantic_source_hash = hashlib.sha256(base_payload.encode("utf-8")).hexdigest()
        super().save(*args, **kwargs)
