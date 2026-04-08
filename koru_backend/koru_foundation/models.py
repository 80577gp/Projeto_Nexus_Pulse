"""Domain models for KORU foundation data."""

from __future__ import annotations

from django.db import connection, models


class University(models.Model):
    """Represents a Brazilian university or admission system."""

    SYSTEM_SISU = "sisu"
    SYSTEM_FUVEST = "fuvest"
    SYSTEM_ENEM = "enem"
    SYSTEM_PROPRIO = "proprio"

    SYSTEM_CHOICES = (
        (SYSTEM_SISU, "SISU"),
        (SYSTEM_FUVEST, "FUVEST"),
        (SYSTEM_ENEM, "ENEM"),
        (SYSTEM_PROPRIO, "Processo Proprio"),
    )

    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=160, unique=True)
    admission_system = models.CharField(max_length=20, choices=SYSTEM_CHOICES, default=SYSTEM_SISU)
    state_code = models.CharField(max_length=2, blank=True)
    website_url = models.URLField(blank=True)
    is_public = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Course(models.Model):
    """Represents a university course offered through a given institution."""

    DEGREE_BACHELOR = "bachelor"
    DEGREE_LICENCIATURA = "licenciatura"
    DEGREE_TECNOLOGO = "tecnologo"

    DEGREE_CHOICES = (
        (DEGREE_BACHELOR, "Bacharelado"),
        (DEGREE_LICENCIATURA, "Licenciatura"),
        (DEGREE_TECNOLOGO, "Tecnologo"),
    )

    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name="courses")
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=160)
    campus = models.CharField(max_length=150, blank=True)
    shift = models.CharField(max_length=50, blank=True)
    degree_type = models.CharField(max_length=20, choices=DEGREE_CHOICES, default=DEGREE_BACHELOR)

    class Meta:
        ordering = ["name", "campus"]
        unique_together = ("university", "slug", "campus")

    def __str__(self):
        return f"{self.name} - {self.university.name}"


class CutoffScore(models.Model):
    """Stores historic cutoff scores for Brazilian exams."""

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="cutoff_scores")
    exam_year = models.PositiveIntegerField()
    quota_category = models.CharField(max_length=120, default="ampla_concorrencia")
    score = models.DecimalField(max_digits=6, decimal_places=2)
    source_label = models.CharField(max_length=120, blank=True)

    class Meta:
        ordering = ["-exam_year", "-score"]
        unique_together = ("course", "exam_year", "quota_category")

    def __str__(self):
        return f"{self.course} - {self.exam_year} - {self.score}"


class Subject(models.Model):
    """Top-level subject in the KORU knowledge graph."""

    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class TopicQuerySet(models.QuerySet):
    """Optimized queryset helpers for topic traversal."""

    def hydrated(self):
        return self.select_related("subject").prefetch_related("prerequisites", "unlocks")


class TopicManager(models.Manager):
    """Manager with recursive CTE helpers for prerequisite traversal."""

    def get_queryset(self):
        return TopicQuerySet(self.model, using=self._db).hydrated()

    def prerequisite_closure(self, topic_id):
        """Return every recursive prerequisite for a topic using a recursive CTE."""
        topic_table = Topic._meta.db_table
        through_table = TopicPrerequisite._meta.db_table
        sql = f"""
            WITH RECURSIVE prerequisite_chain AS (
                SELECT tp.prerequisite_id, tp.topic_id, 1 AS depth
                FROM {through_table} tp
                WHERE tp.topic_id = %s
                UNION ALL
                SELECT next_tp.prerequisite_id, next_tp.topic_id, prerequisite_chain.depth + 1
                FROM {through_table} next_tp
                INNER JOIN prerequisite_chain
                    ON next_tp.topic_id = prerequisite_chain.prerequisite_id
            )
            SELECT DISTINCT t.id
            FROM prerequisite_chain
            INNER JOIN {topic_table} t ON t.id = prerequisite_chain.prerequisite_id
        """
        with connection.cursor() as cursor:
            cursor.execute(sql, [topic_id])
            topic_ids = [row[0] for row in cursor.fetchall()]
        return list(self.get_queryset().filter(id__in=topic_ids))


class Topic(models.Model):
    """Topic node in the knowledge graph."""

    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="topics")
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=160)
    description = models.TextField(blank=True)
    difficulty_level = models.PositiveSmallIntegerField(default=1)
    prerequisites = models.ManyToManyField(
        "self",
        symmetrical=False,
        through="TopicPrerequisite",
        related_name="unlocks",
        blank=True,
    )

    objects = TopicManager()

    class Meta:
        ordering = ["subject__name", "name"]
        unique_together = ("subject", "slug")

    def __str__(self):
        return f"{self.name} - {self.subject.name}"


class TopicPrerequisite(models.Model):
    """Directed edge linking one topic to another prerequisite topic."""

    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="topic_prerequisites")
    prerequisite = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="required_for")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("topic", "prerequisite")

    def __str__(self):
        return f"{self.topic.name} <- {self.prerequisite.name}"
