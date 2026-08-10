from django.urls import path

from .auth_views import (
    ActivateView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    ResendActivationView,
)
from .jwt_views import JWTCreateView, JWTLogoutView, JWTRefreshView
from .me_views import CurrentUserPasswordView, CurrentUserView

urlpatterns = [
    path("jwt/create/", JWTCreateView.as_view(), name="jwt-create"),
    path("jwt/refresh/", JWTRefreshView.as_view(), name="jwt-refresh"),
    path("jwt/logout/", JWTLogoutView.as_view(), name="jwt-logout"),
    path("me/", CurrentUserView.as_view(), name="auth-me"),
    path("me/password/", CurrentUserPasswordView.as_view(), name="auth-me-password"),
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("activate/", ActivateView.as_view(), name="auth-activate"),
    path("resend_activation/", ResendActivationView.as_view(), name="auth-resend"),
    path("password/reset/", PasswordResetRequestView.as_view(), name="auth-password-reset"),
    path(
        "password/reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="auth-password-reset-confirm",
    ),
]
