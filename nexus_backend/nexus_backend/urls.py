"""
Main URL configuration for the nexus_backend project.

This file defines the root routes for the project, including:
- Django Admin
- A dedicated `/api/` entry point for application APIs
"""

from django.contrib import admin
from django.urls import include, path


# API routes are grouped under a single `/api/` prefix to keep the project
# organized and make versioning or future expansion easier.
api_urlpatterns = [
    # Authentication and user-related endpoints.
    path("auth/", include("core_users.urls")),

    # Additional app endpoints can be included here as the project grows.
    # Uncomment these when the corresponding apps and urls.py files exist.
    # path("study-content/", include("study_content.urls")),
    # path("exams/", include("exams.urls")),
    # path("progress/", include("progress.urls")),
]


# Root URL patterns for the project.
urlpatterns = [
    # Django administration panel.
    path("admin/", admin.site.urls),

    # Central entry point for all API routes.
    path("api/", include(api_urlpatterns)),
]

