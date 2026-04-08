"""Cache-backed throttles with Redis-ready configuration."""

from rest_framework.throttling import SimpleRateThrottle


class CacheIdentityThrottle(SimpleRateThrottle):
    """Base throttle using user id when available and IP as fallback."""

    def get_cache_key(self, request, view):
        identity = request.user.pk if getattr(request.user, "is_authenticated", False) else self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": identity}


class APIBurstRateThrottle(CacheIdentityThrottle):
    scope = "api_burst"


class APISustainedRateThrottle(CacheIdentityThrottle):
    scope = "api_sustained"


class AuthBurstRateThrottle(CacheIdentityThrottle):
    scope = "auth_burst"


class AuthSustainedRateThrottle(CacheIdentityThrottle):
    scope = "auth_sustained"
