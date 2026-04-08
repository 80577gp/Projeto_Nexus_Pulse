"""
URL configuration for the core_users app.

These routes are intended to be included under the project's `/api/auth/`
endpoint.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    TokenRefreshView,
    UserLoginView,
    UserLogoutView,
    UserProfileView,
    UserRegistrationView,
)
from .viewsets import AgentActionAuditViewSet, KoruIdentityViewSet


router = DefaultRouter()
router.register("identities", KoruIdentityViewSet, basename="koru-identity")
router.register("audit-events", AgentActionAuditViewSet, basename="agent-audit")


urlpatterns = [
    # Public endpoint used to create a new user account.
    path("register/", UserRegistrationView.as_view(), name="user-register"),

    # Public endpoint used to authenticate an existing user.
    path("login/", UserLoginView.as_view(), name="user-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", UserLogoutView.as_view(), name="user-logout"),

    # Protected endpoint used to retrieve or update the authenticated profile.
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    path("admin/", include(router.urls)),
]
