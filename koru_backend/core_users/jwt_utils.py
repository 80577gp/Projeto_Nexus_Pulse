"""JWT helpers implemented without external dependencies."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
import uuid

from django.conf import settings
from rest_framework import exceptions


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}".encode("ascii"))


def _json_dumps(payload: dict) -> bytes:
    return json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")


def _sign(message: bytes) -> str:
    signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        message,
        hashlib.sha256,
    ).digest()
    return _b64url_encode(signature)


def encode_token(payload: dict) -> str:
    """Encode a JWT payload using HS256."""
    header = {"alg": "HS256", "typ": "JWT"}
    encoded_header = _b64url_encode(_json_dumps(header))
    encoded_payload = _b64url_encode(_json_dumps(payload))
    message = f"{encoded_header}.{encoded_payload}".encode("ascii")
    signature = _sign(message)
    return f"{encoded_header}.{encoded_payload}.{signature}"


def decode_token(token: str, expected_type: str | None = None) -> dict:
    """Decode and validate a JWT signed by the project."""
    try:
        encoded_header, encoded_payload, encoded_signature = token.split(".")
    except ValueError as exc:
        raise exceptions.AuthenticationFailed("Malformed JWT token.") from exc

    message = f"{encoded_header}.{encoded_payload}".encode("ascii")
    if not hmac.compare_digest(encoded_signature, _sign(message)):
        raise exceptions.AuthenticationFailed("Invalid JWT signature.")

    try:
        payload = json.loads(_b64url_decode(encoded_payload))
    except (ValueError, json.JSONDecodeError) as exc:
        raise exceptions.AuthenticationFailed("Invalid JWT payload.") from exc

    if payload.get("exp", 0) < int(time.time()):
        raise exceptions.AuthenticationFailed("JWT token has expired.")
    if expected_type and payload.get("type") != expected_type:
        raise exceptions.AuthenticationFailed("Unexpected JWT token type.")
    return payload


def build_access_payload(user) -> dict:
    """Build the payload for a short-lived access token."""
    now = int(time.time())
    ttl = int(settings.KORU_JWT_ACCESS_TTL.total_seconds())
    return {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "type": "access",
        "iat": now,
        "exp": now + ttl,
        "jti": str(uuid.uuid4()),
    }


def build_refresh_payload(user, session) -> dict:
    """Build the payload for a long-lived refresh token."""
    now = int(time.time())
    ttl = int(settings.KORU_JWT_REFRESH_TTL.total_seconds())
    return {
        "sub": str(user.id),
        "type": "refresh",
        "iat": now,
        "exp": now + ttl,
        "jti": str(session.token_jti),
        "family": str(session.family_id),
    }


def get_refresh_expiry():
    """Return the configured refresh lifetime."""
    return settings.KORU_JWT_REFRESH_TTL
