from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

import django_js_reverse.views
from common.routes import routes as common_routes
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
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
    path("api/auth/", include("users.auth_urls")),
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
]

if settings.DEBUG:
    from django.conf.urls.static import static

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
elif getattr(settings, "SERVE_MEDIA", False):
    urlpatterns += [
        re_path(
            r"^media/(?P<path>.*)$",
            serve,
            {"document_root": settings.MEDIA_ROOT},
        ),
    ]

urlpatterns += [
    # SPA catch-all — debe ir al final para no interceptar API/admin/static/media
    path("", include("common.urls"), name="common"),
]
