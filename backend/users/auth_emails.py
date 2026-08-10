"""Transactional emails for activation and password reset."""

import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

BRAND = "ArtemisApp"


def _frontend_base() -> str:
    base = getattr(settings, "FRONTEND_BASE_URL", "") or ""
    if base:
        return base.rstrip("/")
    host = getattr(settings, "HOST", None)
    if host:
        return str(host).rstrip("/")
    return "http://localhost:8000"


def activation_link(*, uid: str, token: str) -> str:
    return f"{_frontend_base()}/activate/{uid}/{token}/"


def password_reset_link(*, uid: str, token: str) -> str:
    return f"{_frontend_base()}/password/reset/confirm/{uid}/{token}/"


def login_url() -> str:
    return f"{_frontend_base()}/login"


def _send(to_email: str, subject: str, plain: str) -> None:
    send_mail(
        subject,
        plain,
        getattr(settings, "DEFAULT_FROM_EMAIL", None)
        or getattr(settings, "SERVER_EMAIL", "noreply@artemis.local"),
        [to_email],
        fail_silently=False,
    )


def send_activation_email_safe(*, to_email: str, uid: str, token: str) -> None:
    link = activation_link(uid=uid, token=token)
    try:
        _send(
            to_email,
            f"Activa tu cuenta en {BRAND}",
            (
                f"Gracias por registrarte en {BRAND}.\n\n"
                f"Activa tu cuenta con este enlace:\n{link}\n\n"
                "Si no creaste esta cuenta, puedes ignorar este correo."
            ),
        )
    except Exception:
        logger.exception("Activation email failed for %s; link (dev): %s", to_email, link)


def send_activation_confirmed_email_safe(*, to_email: str, user_name: str = "") -> None:
    try:
        _send(
            to_email,
            f"Cuenta activada — bienvenido a {BRAND}",
            (
                f"Tu cuenta en {BRAND} está activa.\n\n"
                f"Inicia sesión: {login_url()}\n"
            ),
        )
    except Exception:
        logger.exception("Activation confirmed email failed for %s", to_email)


def send_password_reset_email_safe(*, to_email: str, uid: str, token: str) -> None:
    link = password_reset_link(uid=uid, token=token)
    try:
        _send(
            to_email,
            f"Restablece tu contraseña — {BRAND}",
            (
                f"Recibimos una solicitud para restablecer tu contraseña en {BRAND}.\n\n"
                f"Elige una nueva contraseña aquí:\n{link}\n\n"
                "Si no solicitaste este cambio, ignora este correo."
            ),
        )
    except Exception:
        logger.exception("Password reset email failed for %s; link (dev): %s", to_email, link)


def send_password_changed_email_safe(*, to_email: str) -> None:
    try:
        _send(
            to_email,
            f"Contraseña actualizada — {BRAND}",
            (
                f"Tu contraseña en {BRAND} se actualizó correctamente.\n\n"
                f"Inicia sesión: {login_url()}\n\n"
                "Si no realizaste este cambio, contacta a soporte de inmediato."
            ),
        )
    except Exception:
        logger.exception("Password changed email failed for %s", to_email)
