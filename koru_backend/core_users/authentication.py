"""Authentication helpers for the core_users app."""

from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication, get_authorization_header

from .jwt_utils import decode_token
from .models import KoruUser


class KoruJWTAuthentication(BaseAuthentication):
    """Authenticate requests that provide a Bearer access token."""

    keyword = b"Bearer"

    def authenticate(self, request):
        """Resolve the authenticated user from a signed JWT access token."""
        auth = get_authorization_header(request).split()
        if not auth or auth[0] != self.keyword:
            return None
        if len(auth) != 2:
            raise exceptions.AuthenticationFailed("Invalid Authorization header.")

        raw_token = auth[1].decode("utf-8")
        payload = decode_token(raw_token, expected_type="access")

        try:
            user = KoruUser.objects.get(id=payload["sub"], is_active=True)
        except KoruUser.DoesNotExist as exc:
            raise exceptions.AuthenticationFailed("User not found.") from exc

        return (user, payload)
