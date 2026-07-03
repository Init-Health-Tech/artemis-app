from django.urls import path, re_path

from . import views


app_name = "common"
urlpatterns = [
    path("", views.IndexView.as_view(), name="index"),
    # SPA: React Router maneja estas rutas en el cliente
    re_path(r"^.*$", views.IndexView.as_view(), name="spa"),
]
