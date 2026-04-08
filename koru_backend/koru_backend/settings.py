"""
Django settings for koru_backend project.

This settings module supports both development and production environments.
It prefers python-decouple when available and falls back to os.environ-based
helpers so the project can still start in lean local environments.
"""

import importlib.util
import os
from pathlib import Path
from datetime import timedelta

try:
    from decouple import Csv, config
except ImportError:
    class Csv:
        """Minimal Csv caster compatible with python-decouple usage."""

        def __init__(self, delimiter=","):
            self.delimiter = delimiter

        def __call__(self, value):
            if not value:
                return []
            return [item.strip() for item in str(value).split(self.delimiter) if item.strip()]

    def config(name, default=None, cast=str):
        """Small fallback replacement for decouple.config."""
        value = os.environ.get(name, default)
        if value is None:
            raise RuntimeError(f"Missing required environment variable: {name}")
        if cast is bool:
            return str(value).strip().lower() in {"1", "true", "yes", "on"}
        if isinstance(cast, Csv):
            return cast(value)
        if callable(cast) and cast is not str:
            return cast(value)
        return value


# Base directory of the Django project.
BASE_DIR = Path(__file__).resolve().parent.parent


# -----------------------------------------------------------------------------
# Core application settings
# -----------------------------------------------------------------------------
# Environment selector. Expected values: "development" or "production".
ENVIRONMENT = config("ENVIRONMENT", default="development")

# Secret key must always come from the environment.
SECRET_KEY = config("SECRET_KEY", default="django-insecure-local-dev-key")

# Debug is loaded as a real boolean from the environment.
DEBUG = config("DEBUG", default=False, cast=bool)

# Allowed hosts are loaded as a list from the environment.
ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default="127.0.0.1,localhost,testserver",
    cast=Csv(),
)


# -----------------------------------------------------------------------------
# Installed apps
# -----------------------------------------------------------------------------
INSTALLED_APPS = [
    # Django built-in apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party apps
    "corsheaders",
    "django.contrib.postgres",
    "rest_framework",
    "rest_framework.authtoken",

    # Local apps
    "core_users",
    "koru_foundation",
    "study_content",
    "diagnostics",
    "ai_integration",
    "pulse_missions",
    "notifications",
]


# -----------------------------------------------------------------------------
# Middleware
# -----------------------------------------------------------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "koru_backend.middleware.AgentSecurityProxy",
]


ROOT_URLCONF = "koru_backend.urls"


TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


WSGI_APPLICATION = "koru_backend.wsgi.application"
ASGI_APPLICATION = "koru_backend.asgi.application"


# -----------------------------------------------------------------------------
# Database
# -----------------------------------------------------------------------------
# PostgreSQL database configuration loaded fully from environment variables.
DATABASES = {
    "default": {
        "ENGINE": config("DB_ENGINE", default="django.db.backends.sqlite3"),
        "NAME": config(
            "DB_NAME",
            default=config("DATABASE_NAME", default="koru_db"),
        ),
        "USER": config("DB_USER", default=config("DATABASE_USER", default="")),
        "PASSWORD": config(
            "DB_PASSWORD",
            default=config("DATABASE_PASSWORD", default=""),
        ),
        "HOST": config("DB_HOST", default=config("DATABASE_HOST", default="localhost")),
        "PORT": config("DB_PORT", default=config("DATABASE_PORT", default=5432), cast=int),
    }
}

if DATABASES["default"]["ENGINE"] == "django.db.backends.sqlite3":
    DATABASES["default"] = {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": config("SQLITE_NAME", default=str(BASE_DIR / "db.sqlite3")),
    }


# -----------------------------------------------------------------------------
# Custom user model
# -----------------------------------------------------------------------------
AUTH_USER_MODEL = "core_users.KoruUser"


# -----------------------------------------------------------------------------
# Password validation
# -----------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# -----------------------------------------------------------------------------
# Internationalization
# -----------------------------------------------------------------------------
LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Sao_Paulo"
USE_I18N = True
USE_TZ = True


# -----------------------------------------------------------------------------
# Static and media files
# -----------------------------------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"] if (BASE_DIR / "static").exists() else []

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# -----------------------------------------------------------------------------
# Default primary key field type
# -----------------------------------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# -----------------------------------------------------------------------------
# CORS configuration
# -----------------------------------------------------------------------------
# In development we allow all origins for faster local integration.
# In production we restrict origins through environment variables.
CORS_ALLOW_ALL_ORIGINS = DEBUG

if not DEBUG:
    CORS_ALLOWED_ORIGINS = config(
        "CORS_ALLOWED_ORIGINS",
        default="https://app.koru.education",
        cast=Csv(),
    )


# -----------------------------------------------------------------------------
# Django REST Framework
# -----------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "core_users.authentication.KoruJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "core_users.throttles.APIBurstRateThrottle",
        "core_users.throttles.APISustainedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "api_burst": config("API_BURST_RATE", default="60/minute"),
        "api_sustained": config("API_SUSTAINED_RATE", default="1000/day"),
        "auth_burst": config("AUTH_BURST_RATE", default="10/minute"),
        "auth_sustained": config("AUTH_SUSTAINED_RATE", default="100/day"),
    },
}


# -----------------------------------------------------------------------------
# Celery / Redis
# -----------------------------------------------------------------------------
# Redis connection parameters loaded from environment variables.
REDIS_HOST = config("REDIS_HOST", default="localhost")
REDIS_PORT = config("REDIS_PORT", default=6379, cast=int)
REDIS_DB = config("REDIS_DB", default=0, cast=int)
REDIS_CACHE_DB = config("REDIS_CACHE_DB", default=1, cast=int)
REDIS_CACHE_URL = config(
    "REDIS_CACHE_URL",
    default=f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_CACHE_DB}",
)

CELERY_BROKER_URL = config(
    "CELERY_BROKER_URL",
    default=f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}",
)
CELERY_RESULT_BACKEND = config(
    "CELERY_RESULT_BACKEND",
    default=f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}",
)
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE

if importlib.util.find_spec("django_redis"):
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": REDIS_CACHE_URL,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
            },
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "koru-backend-cache",
        }
    }

KORU_JWT_ACCESS_TTL = timedelta(
    minutes=config("KORU_JWT_ACCESS_TTL_MINUTES", default=15, cast=int)
)
KORU_JWT_REFRESH_TTL = timedelta(
    days=config("KORU_JWT_REFRESH_TTL_DAYS", default=14, cast=int)
)

PGVECTOR_ENABLED = config("PGVECTOR_ENABLED", default=False, cast=bool)
NEO4J_BOLT_URL = config("NEO4J_BOLT_URL", default="bolt://localhost:7687")
NEO4J_USERNAME = config("NEO4J_USERNAME", default="neo4j")
NEO4J_PASSWORD = config("NEO4J_PASSWORD", default="password")


# -----------------------------------------------------------------------------
# Production security settings
# -----------------------------------------------------------------------------
# These settings are only enabled in production to improve deployment security.
if ENVIRONMENT == "production" and not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)
    SESSION_COOKIE_SECURE = config("SESSION_COOKIE_SECURE", default=True, cast=bool)
    CSRF_COOKIE_SECURE = config("CSRF_COOKIE_SECURE", default=True, cast=bool)
    SECURE_HSTS_SECONDS = config("SECURE_HSTS_SECONDS", default=31536000, cast=int)
    SECURE_HSTS_INCLUDE_SUBDOMAINS = config(
        "SECURE_HSTS_INCLUDE_SUBDOMAINS",
        default=True,
        cast=bool,
    )
    SECURE_HSTS_PRELOAD = config("SECURE_HSTS_PRELOAD", default=True, cast=bool)
    SECURE_CONTENT_TYPE_NOSNIFF = config(
        "SECURE_CONTENT_TYPE_NOSNIFF",
        default=True,
        cast=bool,
    )
    X_FRAME_OPTIONS = "DENY"
