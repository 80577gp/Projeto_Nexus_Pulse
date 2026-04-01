"""
URL configuration for the core_users app.

These routes are intended to be included under the project's `/api/auth/`
endpoint.
"""

from django.urls import path

from .views import UserLoginView, UserProfileView, UserRegistrationView


urlpatterns = [
    # Public endpoint used to create a new user account.
    path("register/", UserRegistrationView.as_view(), name="user-register"),

    # Public endpoint used to authenticate an existing user.
    path("login/", UserLoginView.as_view(), name="user-login"),

    # Protected endpoint used to retrieve or update the authenticated profile.
    path("profile/", UserProfileView.as_view(), name="user-profile"),
]

