"""
Authentication helpers for the core_users app.
"""

from rest_framework.authentication import TokenAuthentication


class BearerTokenAuthentication(TokenAuthentication):
    """
    DRF token authentication that accepts the `Bearer` keyword.

    This keeps the backend compatible with frontend requests that send
    `Authorization: Bearer <token>`.
    """

    keyword = "Bearer"

