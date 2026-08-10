"""
Custom JWT views: store refresh token in HttpOnly cookie, return only access in JSON.
"""

import logging

from django.conf import settings
from django.contrib.auth import authenticate, user_logged_in
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)

REFRESH_COOKIE_NAME = getattr(settings, "JWT_REFRESH_COOKIE_NAME", "refresh_token")


def _cookie_params():
    same_site = getattr(settings, "JWT_COOKIE_SAMESITE", "Lax")
    secure = not getattr(settings, "DEBUG", True) or same_site == "None"
    if same_site == "None" and not secure:
        same_site = "Lax"
    refresh_lifetime = getattr(settings, "REFRESH_TOKEN_LIFETIME", None)
    if refresh_lifetime is not None:
        max_age = int(refresh_lifetime.total_seconds())
    else:
        max_age = 86400
    return {
        "httponly": True,
        "secure": secure,
        "samesite": same_site,
        "max_age": max_age,
        "path": "/",
    }


class JWTCreateView(APIView):
    """Login: email + password → JSON access + HttpOnly refresh cookie."""

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email") or request.data.get("username")
        password = request.data.get("password")
        if not email or not password:
            return Response(
                {"detail": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = authenticate(request, username=email, password=password)
        if not user:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_active:
            return Response(
                {"detail": "User account is disabled."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        user_logged_in.send(sender=user.__class__, request=request, user=user)
        try:
            refresh = RefreshToken.for_user(user)
            access = str(refresh.access_token)
            refresh_str = str(refresh)
        except Exception:
            logger.exception("JWT create failed")
            return Response(
                {"detail": "Could not create tokens."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        response = Response({"access": access}, status=status.HTTP_200_OK)
        response.set_cookie(REFRESH_COOKIE_NAME, refresh_str, **_cookie_params())
        return response


class JWTRefreshView(APIView):
    """Refresh: read refresh from cookie → new access JSON + rotated refresh cookie."""

    permission_classes = [AllowAny]

    def post(self, request):
        refresh_str = request.COOKIES.get(REFRESH_COOKIE_NAME)
        if not refresh_str:
            return Response(
                {"detail": "Refresh token missing."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        try:
            refresh = RefreshToken(refresh_str)
            user_id = refresh.get("user_id")
            from django.contrib.auth import get_user_model

            User = get_user_model()
            user = User.objects.filter(pk=user_id).first()
            if user and user.is_active:
                new_refresh = RefreshToken.for_user(user)
                new_access = str(new_refresh.access_token)
                new_refresh_str = str(new_refresh)
            else:
                new_access = str(refresh.access_token)
                new_refresh_str = refresh_str
        except (TokenError, InvalidToken, Exception) as e:
            logger.debug("JWT refresh failed: %s", e)
            response = Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            response.delete_cookie(REFRESH_COOKIE_NAME, path="/")
            return response
        response = Response({"access": new_access}, status=status.HTTP_200_OK)
        response.set_cookie(REFRESH_COOKIE_NAME, new_refresh_str, **_cookie_params())
        return response


class JWTLogoutView(APIView):
    """Clear refresh cookie."""

    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({"detail": "Logged out."}, status=status.HTTP_200_OK)
        response.delete_cookie(REFRESH_COOKIE_NAME, path="/")
        return response
