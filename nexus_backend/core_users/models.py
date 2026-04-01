"""
Models for the core_users app.

This module defines the custom user model used across the project.
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """
    Custom manager for the User model.

    Uses email as the primary authentication field and keeps the default
    username as a required secondary field.
    """

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

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, username, password, **extra_fields)


class User(AbstractUser):
    """Custom user model for students, teachers, and administrators."""

    ROLE_STUDENT = "student"
    ROLE_TEACHER = "teacher"
    ROLE_ADMIN = "admin"

    ROLE_CHOICES = (
        (ROLE_STUDENT, "Student"),
        (ROLE_TEACHER, "Teacher"),
        (ROLE_ADMIN, "Admin"),
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

    # These flags are explicit here to keep defaults clear in the custom model.
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # Automatically stores the timestamp when the user is created.
    date_joined = models.DateTimeField(auto_now_add=True)

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = UserManager()

    def __str__(self):
        """Return the email address as the display value for the user."""
        return self.email
