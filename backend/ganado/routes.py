from .views import (
    AlimentoViewSet,
    AnimalViewSet,
    DashboardViewSet,
    EventoAnimalViewSet,
    LecturaRFIDViewSet,
    LoteViewSet,
)


routes = [
    {"regex": r"animales", "viewset": AnimalViewSet, "basename": "Animal"},
    {"regex": r"lotes", "viewset": LoteViewSet, "basename": "Lote"},
    {"regex": r"alimentos", "viewset": AlimentoViewSet, "basename": "Alimento"},
    {"regex": r"eventos", "viewset": EventoAnimalViewSet, "basename": "EventoAnimal"},
    {"regex": r"rfid", "viewset": LecturaRFIDViewSet, "basename": "LecturaRFID"},
    {"regex": r"dashboard", "viewset": DashboardViewSet, "basename": "Dashboard"},
]
