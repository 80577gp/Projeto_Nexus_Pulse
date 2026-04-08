"""
Main URL configuration for the koru_backend project.

This file defines the root routes for the project, including:
- Django Admin
- A dedicated `/api/` entry point for application APIs
"""

from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView


# API routes are grouped under a single `/api/` prefix to keep the project
# organized and make versioning or future expansion easier.
api_urlpatterns = [
    # Authentication and user-related endpoints.
    path("auth/", include("core_users.urls")),
    path("foundation/", include("koru_foundation.urls")),
    path("study-content/", include("study_content.urls")),
    path("diagnostics/", include("diagnostics.urls")),
    path("ai/", include("ai_integration.urls")),
    path("pulse-missions/", include("pulse_missions.urls")),
    path("notifications/", include("notifications.urls")),
]


# Root URL patterns for the project.
urlpatterns = [
    # Redirect the site root to the Django admin for an immediate visual entry point.
    path("", RedirectView.as_view(pattern_name="admin:index", permanent=False)),

    # Django administration panel.
    path("admin/", admin.site.urls),

    # Central entry point for all API routes.
    path("api/", include(api_urlpatterns)),
]
