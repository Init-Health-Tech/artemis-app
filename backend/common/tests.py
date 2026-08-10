from django.test import override_settings

from common.utils.tests import TestCaseUtils


class TestIndexView(TestCaseUtils):
    view_name = "common:index"

    def test_returns_status_200(self):
        response = self.auth_client.get(self.reverse(self.view_name))
        self.assertResponse200(response)

    def test_spa_routes_serve_index_on_refresh(self):
        for path in (
            "/",
            "/dashboard",
            "/rfid",
            "/animales",
            "/lotes",
            "/inventario",
            "/estados",
            "/login",
            "/recuperar-contrasena",
        ):
            response = self.auth_client.get(path)
            self.assertEqual(response.status_code, 200, path)


class TestAdminEnvironmentNotice(TestCaseUtils):
    view_name = "admin:index"

    def setUp(self):
        super().setUp()
        self.user.is_staff = True
        self.user.is_superuser = True
        self.user.save(update_fields=["is_staff", "is_superuser"])

    @override_settings(
        ADMIN_ENVIRONMENT_LABEL="Review App",
        ADMIN_ENVIRONMENT_COLOR="#0f172a",
        ADMIN_ENVIRONMENT_BACKGROUND_COLOR="#facc15",
    )
    def test_admin_index_shows_configured_environment_notice_styles(self):
        self.client.force_login(self.user)
        response = self.client.get(self.reverse(self.view_name))

        self.assertResponse200(response)
        self.assertContains(response, "Review App")
        self.assertContains(response, "color: #0f172a;")
        self.assertContains(response, "background-color: #facc15;")
