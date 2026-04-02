"""
Management command to create or update the project's main superuser.

This command is safe to run multiple times. It creates the superuser if it does
not exist yet, or updates the existing one to ensure the expected admin flags
and profile fields are set.
"""

import os

from django.core.management.base import BaseCommand, CommandError

from core_users.models import User


class Command(BaseCommand):
    """Create or update an admin superuser for the project."""

    help = "Create or update the project's main superuser from environment variables."

    def handle(self, *args, **options):
        """Create or update the configured project superuser."""
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@nexuspulse.local")
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")
        first_name = os.environ.get("DJANGO_SUPERUSER_FIRST_NAME", "Nexus")
        last_name = os.environ.get("DJANGO_SUPERUSER_LAST_NAME", "Admin")

        if not password:
            raise CommandError(
                "DJANGO_SUPERUSER_PASSWORD is required to create the project superuser."
            )

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": username,
                "first_name": first_name,
                "last_name": last_name,
                "role": User.ROLE_ADMIN,
                "is_active": True,
                "is_staff": True,
                "is_superuser": True,
            },
        )

        user.username = username
        user.first_name = first_name
        user.last_name = last_name
        user.role = User.ROLE_ADMIN
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        if created:
            self.stdout.write(
                self.style.SUCCESS(f"Superuser created successfully: {email}")
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f"Superuser updated successfully: {email}")
            )

