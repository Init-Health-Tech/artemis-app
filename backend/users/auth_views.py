"""
Registration, email activation, and password reset.
"""

from django.conf import settings
from django.contrib.auth import get_user_model, password_validation
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .auth_emails import (
    send_activation_confirmed_email_safe,
    send_activation_email_safe,
    send_password_changed_email_safe,
    send_password_reset_email_safe,
)
from .auth_serializers import (
    ActivateSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    ResendActivationSerializer,
)
from .throttling import (
    ActivationResendThrottle,
    PasswordResetThrottle,
    RegisterThrottle,
)

User = get_user_model()


def _encode_uid(user) -> str:
    return urlsafe_base64_encode(force_bytes(str(user.pk)))


def _decode_uid(uid: str):
    try:
        raw = force_str(urlsafe_base64_decode(uid))
        return User.objects.get(pk=raw)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return None


def _registration_require_activation() -> bool:
    return getattr(settings, "REGISTRATION_REQUIRE_EMAIL_ACTIVATION", True)


def _finalize_registration_response(user, *, require_activation: bool):
    if not require_activation:
        return Response(
            {"detail": "Registration successful. You can sign in now."},
            status=status.HTTP_201_CREATED,
        )

    uid = _encode_uid(user)
    token = default_token_generator.make_token(user)
    send_activation_email_safe(to_email=user.email, uid=uid, token=token)
    return Response(
        {"detail": "Registration successful. Check your email to activate your account."},
        status=status.HTTP_201_CREATED,
    )


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [RegisterThrottle]

    def post(self, request):
        if not getattr(settings, "REGISTRATION_OPEN", False):
            return Response(
                {"detail": "El registro público no está disponible."},
                status=status.HTTP_403_FORBIDDEN,
            )

        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        email = data["email"].lower()

        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "A user with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        require_activation = _registration_require_activation()
        user = User.objects.create_user(
            email=email,
            password=data["password"],
            is_active=not require_activation,
        )
        return _finalize_registration_response(user, require_activation=require_activation)


class ActivateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = ActivateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        uid = ser.validated_data["uid"]
        token = ser.validated_data["token"]

        user = _decode_uid(uid)
        if user is None:
            return Response(
                {"detail": "Invalid activation link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.is_active:
            return Response({"detail": "Account is already active."})

        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Invalid or expired activation link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = True
        user.save(update_fields=["is_active"])
        send_activation_confirmed_email_safe(to_email=user.email)
        return Response({"detail": "Your account has been activated."})


class ResendActivationView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ActivationResendThrottle]

    def post(self, request):
        ser = ResendActivationSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        email = ser.validated_data["email"].lower()
        detail = {
            "detail": "If an inactive account exists for this email, we sent a new link.",
        }

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(detail)

        if user.is_active:
            return Response(detail)

        uid = _encode_uid(user)
        token = default_token_generator.make_token(user)
        send_activation_email_safe(to_email=user.email, uid=uid, token=token)
        return Response(detail)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        ser = PasswordResetRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        email = ser.validated_data["email"].lower()

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            pass
        else:
            if user.is_active:
                uid = _encode_uid(user)
                token = default_token_generator.make_token(user)
                send_password_reset_email_safe(to_email=user.email, uid=uid, token=token)

        return Response(
            {
                "detail": (
                    "If an account exists for this email, we sent password reset instructions."
                ),
            },
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = PasswordResetConfirmSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        uid = ser.validated_data["uid"]
        token = ser.validated_data["token"]
        new_password = ser.validated_data["new_password"]

        user = _decode_uid(uid)
        if user is None:
            return Response(
                {"detail": "Invalid reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            password_validation.validate_password(new_password, user=user)
        except DjangoValidationError as e:
            return Response(
                {"new_password": list(e.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=["password"])
        send_password_changed_email_safe(to_email=user.email)
        return Response({"detail": "Password has been reset. You can sign in now."})
