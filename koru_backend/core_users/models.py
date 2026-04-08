"""
Models for the core_users app.

This module defines the KORU custom user model and refresh-session tracking for
rotating JWT authentication.
"""

import uuid

from django.contrib.auth.models import AbstractUser, BaseUserManager, Group, Permission
from django.db import models
from django.utils import timezone


class KoruUserManager(BaseUserManager):
    """Manager for the KORU custom user model."""

    def create_user(self, email, username, password=None, **extra_fields):
        """Create and return a regular user with a normalized email."""
        if not email:
            raise ValueError("The email field must be provided.")
        if not username:
            raise ValueError("The username field must be provided.")

        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)

        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        """Create and return a superuser with the required admin flags."""
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", KoruUser.ROLE_ADMIN)

        if not password:
            raise ValueError("Superuser must have a password.")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, username, password, **extra_fields)


class KoruUser(AbstractUser):
    """Custom user model for students, teachers, and administrators."""

    ROLE_STUDENT = "student"
    ROLE_TEACHER = "teacher"
    ROLE_ADMIN = "admin"

    ROLE_CHOICES = (
        (ROLE_STUDENT, "Student"),
        (ROLE_TEACHER, "Teacher"),
        (ROLE_ADMIN, "Admin"),
    )

    AGENT_NONE = "none"
    AGENT_DEEPSCAN = "deepscan"
    AGENT_GUIDE = "guide"
    AGENT_RAG = "rag"

    AGENT_TYPE_CHOICES = (
        (AGENT_NONE, "None"),
        (AGENT_DEEPSCAN, "DeepScan"),
        (AGENT_GUIDE, "Guide"),
        (AGENT_RAG, "RAG"),
    )

    email = models.EmailField(
        unique=True,
        help_text="Primary email used for authentication.",
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_STUDENT,
        help_text="Defines the user role in the platform.",
    )
    school_year = models.CharField(
        max_length=30,
        blank=True,
        null=True,
        help_text="School year or grade, for example '9o Ano' or '1a Serie EM'.",
    )
    is_non_human_identity = models.BooleanField(
        default=False,
        help_text="Identifies service accounts used by AI agents and automations.",
    )
    agent_type = models.CharField(
        max_length=20,
        choices=AGENT_TYPE_CHOICES,
        default=AGENT_NONE,
        help_text="Declares the agent persona linked to this identity.",
    )
    audit_label = models.CharField(
        max_length=120,
        blank=True,
        help_text="Human-readable label for audit trails.",
    )
    groups = models.ManyToManyField(
        Group,
        blank=True,
        related_name="koru_users",
        related_query_name="koru_user",
        db_table="core_users_user_groups",
        help_text="The groups this user belongs to.",
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        blank=True,
        related_name="koru_users",
        related_query_name="koru_user",
        db_table="core_users_user_user_permissions",
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = KoruUserManager()

    class Meta:
        db_table = "core_users_user"
        verbose_name = "KORU user"
        verbose_name_plural = "KORU users"

    def __str__(self):
        """Return the email address as the display value for the user."""
        return self.email


class RefreshSession(models.Model):
    """Tracks refresh tokens so JWT rotation can revoke previous sessions."""

    user = models.ForeignKey(
        KoruUser,
        on_delete=models.CASCADE,
        related_name="refresh_sessions",
    )
    token_jti = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    family_id = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    replaced_by_jti = models.UUIDField(blank=True, null=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def is_active(self):
        """Return whether the refresh session can still be used."""
        return self.revoked_at is None and self.expires_at > timezone.now()

    def revoke(self, replaced_by_jti=None):
        """Mark the current refresh session as revoked."""
        self.revoked_at = timezone.now()
        if replaced_by_jti:
            self.replaced_by_jti = replaced_by_jti
        self.save(update_fields=["revoked_at", "replaced_by_jti", "updated_at"])


class AgentActionAudit(models.Model):
    """Immutable audit trail for non-human identity actions."""

    actor = models.ForeignKey(
        KoruUser,
        on_delete=models.CASCADE,
        related_name="agent_audit_events",
    )
    action = models.CharField(max_length=120)
    target_resource = models.CharField(max_length=255)
    request_id = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.actor.email} - {self.action}"


User = KoruUser
