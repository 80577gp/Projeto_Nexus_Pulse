"""
URL configuration for the notifications app.

This module registers notification-related ViewSets using DRF's DefaultRouter.
"""

from rest_framework.routers import DefaultRouter

from .views import BeRealMomentViewSet, NotificationViewSet


# Router responsible for generating RESTful routes for notifications and
# BeReal-style moments.
router = DefaultRouter()
router.register("notifications", NotificationViewSet, basename="notification")
router.register("bereal-moments", BeRealMomentViewSet, basename="bereal-moment")


# Router-generated URL patterns for the app.
urlpatterns = router.urls

