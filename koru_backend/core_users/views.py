"""
Views for the core_users app.

This module provides endpoints for user registration, login, token rotation,
logout, and profile retrieval/update.
"""

from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .jwt_utils import (
    build_access_payload,
    build_refresh_payload,
    decode_token,
    encode_token,
    get_refresh_expiry,
)
from .models import RefreshSession
from .serializers import (
    LogoutSerializer,
    TokenRefreshSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
)
from .throttles import AuthBurstRateThrottle, AuthSustainedRateThrottle


def _build_token_response(user, refresh_session):
    access_token = encode_token(build_access_payload(user))
    refresh_token = encode_token(build_refresh_payload(user, refresh_session))
    return {
        "access": access_token,
        "refresh": refresh_token,
        "user": UserProfileSerializer(user).data,
    }


def _resolve_client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


class UserRegistrationView(generics.CreateAPIView):
    """Public endpoint used to register a new user."""

    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthBurstRateThrottle, AuthSustainedRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh_session = RefreshSession.objects.create(
            user=user,
            expires_at=timezone.now() + get_refresh_expiry(),
            ip_address=_resolve_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:255],
        )
        headers = self.get_success_headers(serializer.data)
        return Response(
            _build_token_response(user, refresh_session),
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class UserLoginView(APIView):
    """Public endpoint used to authenticate an existing user."""

    permission_classes = [AllowAny]
    serializer_class = UserLoginSerializer
    throttle_classes = [AuthBurstRateThrottle, AuthSustainedRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        refresh_session = RefreshSession.objects.create(
            user=user,
            expires_at=timezone.now() + get_refresh_expiry(),
            ip_address=_resolve_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:255],
        )
        return Response(_build_token_response(user, refresh_session), status=status.HTTP_200_OK)


class TokenRefreshView(APIView):
    """Rotate a refresh token and return a fresh token pair."""

    permission_classes = [AllowAny]
    serializer_class = TokenRefreshSerializer
    throttle_classes = [AuthBurstRateThrottle, AuthSustainedRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        payload = decode_token(serializer.validated_data["refresh"], expected_type="refresh")
        refresh_session = RefreshSession.objects.select_related("user").get(token_jti=payload["jti"])

        if not refresh_session.is_active:
            return Response(
                {"detail": "Refresh session is no longer active."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        new_session = RefreshSession.objects.create(
            user=refresh_session.user,
            family_id=refresh_session.family_id,
            expires_at=timezone.now() + get_refresh_expiry(),
            ip_address=_resolve_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:255],
        )
        refresh_session.revoke(replaced_by_jti=new_session.token_jti)
        return Response(_build_token_response(refresh_session.user, new_session), status=status.HTTP_200_OK)


class UserLogoutView(APIView):
    """Revoke a refresh token so it can no longer be rotated."""

    permission_classes = [AllowAny]
    serializer_class = LogoutSerializer
    throttle_classes = [AuthBurstRateThrottle, AuthSustainedRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        payload = decode_token(serializer.validated_data["refresh"], expected_type="refresh")
        refresh_session = RefreshSession.objects.filter(token_jti=payload["jti"]).first()
        if refresh_session and refresh_session.revoked_at is None:
            refresh_session.revoke()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Protected endpoint used to retrieve and update the authenticated user."""

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return type(self.request.user).objects.get(pk=self.request.user.pk)
