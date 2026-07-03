from django.conf import settings
from django.contrib import admin
from django.urls import include, path

import django_js_reverse.views
from common.routes import routes as common_routes
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from ganado.auth_views import LoginView, LogoutView, SessionView
from ganado.routes import routes as ganado_routes
from rest_framework.routers import DefaultRouter
from users.routes import routes as users_routes

admin.site.site_header = "ArtemisApp"
admin.site.site_title = "ArtemisApp"
admin.site.index_title = "Administración del rancho"

router = DefaultRouter()

routes = common_routes + users_routes + ganado_routes
for route in routes:
    router.register(route["regex"], route["viewset"], basename=route["basename"])

urlpatterns = [
    path("admin/", admin.site.urls, name="admin"),
    path("admin/defender/", include("defender.urls")),
    path("jsreverse/", django_js_reverse.views.urls_js, name="js_reverse"),
    path("api/auth/login/", LoginView.as_view(), name="auth-login"),
    path("api/auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("api/auth/session/", SessionView.as_view(), name="auth-session"),
    path("api/", include(router.urls), name="api"),
    # drf-spectacular
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/schema/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    # SPA catch-all — debe ir al final para no interceptar API/admin/static
    path("", include("common.urls"), name="common"),
]

if settings.DEBUG:
    from django.conf.urls.static import static

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
