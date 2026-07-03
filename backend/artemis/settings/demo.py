"""
Settings para despliegue demo en producción (Docker).
Sin SSL forzado, sin Celery/RabbitMQ, frontend empaquetado con Webpack.
"""

from decouple import Csv, config

from .base import *


DEBUG = config("DEBUG", default=False, cast=bool)

SECRET_KEY = config("SECRET_KEY", default="demo-insecure-change-me")  # noqa: S105

ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())

CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default="http://localhost:8000,http://127.0.0.1:8000",
    cast=Csv(),
)

HOST = config("HOST", default="http://localhost:8000")

# Demo HTTP (sin proxy TLS)
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_HSTS_SECONDS = 0

STATIC_ROOT = base_dir_join("staticfiles")
STATIC_URL = "/static/"

MEDIA_ROOT = base_dir_join("mediafiles")
MEDIA_URL = "/media/"

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

AUTH_PASSWORD_VALIDATORS = []

# Sin Redis/Celery en demo
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

WEBPACK_LOADER["DEFAULT"]["CACHE"] = True

MIDDLEWARE = [m for m in MIDDLEWARE if m != "defender.middleware.FailedLoginMiddleware"]

ADMIN_ENVIRONMENT_LABEL = config("ADMIN_ENVIRONMENT_LABEL", default="Demo")
ADMIN_ENVIRONMENT_COLOR = config("ADMIN_ENVIRONMENT_COLOR", default="#e2e2e2")
ADMIN_ENVIRONMENT_BACKGROUND_COLOR = config(
    "ADMIN_ENVIRONMENT_BACKGROUND_COLOR", default="#6aab6e"
)

# Credenciales demo (expuestas al template / logs de arranque)
DEMO_USER_EMAIL = config("DEMO_USER_EMAIL", default="demo@artemis.local")
DEMO_USER_PASSWORD = config("DEMO_USER_PASSWORD", default="demo123")
DEMO_ADMIN_EMAIL = config("DEMO_ADMIN_EMAIL", default="admin@artemis.local")
DEMO_ADMIN_PASSWORD = config("DEMO_ADMIN_PASSWORD", default="admin123")

SENTRY_DSN = config("SENTRY_DSN", default="")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}
