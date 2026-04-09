"""
URL configuration for the ai_integration app.

This module defines the endpoint used to generate AI-assisted content.
"""

from django.urls import path

from .views import AIGenerateContentView, DeepScanAnalysisView


urlpatterns = [
    # Authenticated endpoint that proxies content generation requests to OpenAI.
    path(
        "generate-content/",
        AIGenerateContentView.as_view(),
        name="ai-generate-content",
    ),
    path(
        "deepscan/analyze/",
        DeepScanAnalysisView.as_view(),
        name="ai-deepscan-analyze",
    ),
]

