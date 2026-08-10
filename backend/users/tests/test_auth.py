from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from model_bakery import baker


class JWTAuthTests(APITestCase):
    def setUp(self):
        self.password = "admin123"
        self.user = baker.prepare("users.User", email="admin@artemis.local", is_active=True)
        self.user.set_password(self.password)
        self.user.save()

    def test_jwt_create_sets_refresh_cookie(self):
        response = self.client.post(
            reverse("jwt-create"),
            {"email": self.user.email, "password": self.password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh_token", response.cookies)

    def test_jwt_create_invalid_credentials(self):
        response = self.client.post(
            reverse("jwt-create"),
            {"email": self.user.email, "password": "wrong"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_jwt_refresh_and_me(self):
        create = self.client.post(
            reverse("jwt-create"),
            {"email": self.user.email, "password": self.password},
            format="json",
        )
        refresh = self.client.post(reverse("jwt-refresh"), format="json")
        self.assertEqual(refresh.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh.data)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.data['access']}")
        me = self.client.get(reverse("auth-me"))
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.assertEqual(me.data["email"], self.user.email)

    def test_me_requires_auth(self):
        response = self.client.get(reverse("auth-me"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_clears_cookie(self):
        self.client.post(
            reverse("jwt-create"),
            {"email": self.user.email, "password": self.password},
            format="json",
        )
        response = self.client.post(reverse("jwt-logout"), format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Cookie deleted (empty / max-age 0)
        cookie = response.cookies.get("refresh_token")
        self.assertIsNotNone(cookie)
        self.assertEqual(cookie.value, "")

    def test_register_closed_by_default(self):
        response = self.client.post(
            reverse("auth-register"),
            {
                "email": "new@artemis.local",
                "password": "securepass123",
                "re_password": "securepass123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_password_reset_request_always_ok(self):
        response = self.client.post(
            reverse("auth-password-reset"),
            {"email": self.user.email},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_bearer_access_token_works(self):
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
        me = self.client.get(reverse("auth-me"))
        self.assertEqual(me.status_code, status.HTTP_200_OK)
