"""
Views for the core_users app.

This module provides endpoints for user registration, login, and profile
retrieval/update.
"""

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView

from .serializers import (
    UserLoginSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
)


class UserRegistrationView(generics.CreateAPIView):
    """
    API endpoint used to register a new user.

    This endpoint is public and creates a new account after serializer
    validation succeeds.
    """

    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class UserLoginView(APIView):
    """
    API endpoint used to authenticate a user.

    This view validates credentials and returns a basic success response.
    Token or JWT issuing can be added here depending on the authentication
    strategy adopted by the project.
    """

    permission_classes = [AllowAny]
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        """Validate credentials and return authenticated user details."""
        serializer = self.serializer_class(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "message": "Login successful.",
                "token": token.key,
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint used to retrieve and update the authenticated user's profile.

    Only authenticated users can access this endpoint.
    """

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Return the currently authenticated user."""
        return self.request.user
