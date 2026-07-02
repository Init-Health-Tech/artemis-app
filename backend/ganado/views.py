from datetime import timedelta

from django.db.models import F, Q
from django.utils import timezone
from django_filters import rest_framework as filters
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Alimento, Animal, EventoAnimal, LecturaRFID, Lote, MovimientoAlimento
from .services.rfid_lote import aplicar_cambio_lote_por_lectura
from .serializers import (
    AlimentoSerializer,
    AnimalDetailSerializer,
    AnimalListSerializer,
    EventoAnimalSerializer,
    LecturaRFIDScanSerializer,
    LecturaRFIDSerializer,
    LoteDetailSerializer,
    LoteSerializer,
    MovimientoAlimentoSerializer,
)


class AnimalFilter(filters.FilterSet):
    lote = filters.NumberFilter(field_name="lote_id")
    estado = filters.CharFilter(field_name="estado")
    especie = filters.CharFilter(field_name="especie")
    search = filters.CharFilter(method="filter_search")

    class Meta:
        model = Animal
        fields = ["lote", "estado", "especie"]

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(numero_interno__icontains=value)
            | Q(rfid_tag__icontains=value)
            | Q(raza__icontains=value)
        )


class AnimalViewSet(viewsets.ModelViewSet):
    queryset = Animal.objects.select_related("lote").all()
    permission_classes = [IsAuthenticated]
    filterset_class = AnimalFilter

    def get_serializer_class(self):
        if self.action == "retrieve":
            return AnimalDetailSerializer
        return AnimalListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == "retrieve":
            return qs.prefetch_related(
                "eventos__usuario_responsable",
                "lecturas_rfid__ubicacion_lote",
            )
        return qs

    @action(detail=True, methods=["post"], url_path="eventos")
    def agregar_evento(self, request, pk=None):
        animal = self.get_object()
        serializer = EventoAnimalSerializer(data={**request.data, "animal": animal.pk})
        serializer.is_valid(raise_exception=True)
        if not serializer.validated_data.get("usuario_responsable"):
            serializer.save(usuario_responsable=request.user)
        else:
            serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LoteViewSet(viewsets.ModelViewSet):
    queryset = Lote.objects.select_related("tipo_alimento_actual").all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return LoteDetailSerializer
        return LoteSerializer


class AlimentoViewSet(viewsets.ModelViewSet):
    queryset = Alimento.objects.all()
    serializer_class = AlimentoSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["post"], url_path="movimiento")
    def registrar_movimiento(self, request, pk=None):
        alimento = self.get_object()
        serializer = MovimientoAlimentoSerializer(data={**request.data, "alimento": alimento.pk})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        alimento.refresh_from_db()
        return Response(
            {
                "movimiento": serializer.data,
                "alimento": AlimentoSerializer(alimento).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["get"], url_path="movimientos")
    def listar_movimientos(self, request, pk=None):
        alimento = self.get_object()
        movimientos = alimento.movimientos.all()[:20]
        return Response(MovimientoAlimentoSerializer(movimientos, many=True).data)


class EventoAnimalViewSet(viewsets.ModelViewSet):
    queryset = EventoAnimal.objects.select_related("animal", "usuario_responsable").all()
    serializer_class = EventoAnimalSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["animal", "tipo"]

    def perform_create(self, serializer):
        usuario = serializer.validated_data.get("usuario_responsable") or self.request.user
        serializer.save(usuario_responsable=usuario)


class LecturaRFIDViewSet(viewsets.ModelViewSet):
    queryset = LecturaRFID.objects.select_related("animal", "ubicacion_lote").all()
    serializer_class = LecturaRFIDSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    @action(detail=False, methods=["post"], url_path="escanear")
    def escanear(self, request):
        serializer = LecturaRFIDScanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        rfid_tag = data["rfid_tag"].strip()

        animal = Animal.objects.filter(rfid_tag=rfid_tag).select_related("lote").first()
        lote_destino = data.get("ubicacion_lote")
        cambio_lote = {
            "hubo_cambio_lote": False,
            "lote_anterior": None,
            "lote_nuevo": None,
            "tipo_movimiento": None,
        }

        if animal and lote_destino:
            cambio_lote = aplicar_cambio_lote_por_lectura(animal, lote_destino, request.user)

        lectura = LecturaRFID.objects.create(
            animal=animal,
            rfid_tag_leido=rfid_tag,
            ubicacion_lote=lote_destino,
            ubicacion_texto=data.get("ubicacion_texto", ""),
            procesado=animal is not None,
        )

        if animal:
            if cambio_lote["hubo_cambio_lote"]:
                if cambio_lote["tipo_movimiento"] == "traslado":
                    origen = cambio_lote["lote_anterior"]["nombre"]
                    destino = cambio_lote["lote_nuevo"]["nombre"]
                    mensaje = (
                        f"Animal {animal.numero_interno} identificado. "
                        f"Trasladado de {origen} a {destino}."
                    )
                else:
                    destino = cambio_lote["lote_nuevo"]["nombre"]
                    mensaje = (
                        f"Animal {animal.numero_interno} identificado. "
                        f"Asignado al lote {destino}."
                    )
            else:
                mensaje = f"Animal {animal.numero_interno} identificado."
            animal.refresh_from_db()
            animal = Animal.objects.prefetch_related(
                "eventos__usuario_responsable", "lecturas_rfid__ubicacion_lote"
            ).get(pk=animal.pk)
            animal_data = AnimalDetailSerializer(animal).data
        else:
            mensaje = "Tag no registrado. Puede crear un animal nuevo con este tag."
            animal_data = None

        response_data = {
            "lectura": LecturaRFIDSerializer(lectura).data,
            "animal": animal_data,
            "registrado": animal is not None,
            "mensaje": mensaje,
            **cambio_lote,
        }
        return Response(response_data, status=status.HTTP_200_OK)


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        dias = int(request.query_params.get("dias_sin_lectura", 30))
        desde = timezone.now() - timedelta(days=dias)

        animales_activos = Animal.objects.filter(estado=Animal.Estado.ACTIVO).count()
        animales_con_lectura = (
            LecturaRFID.objects.filter(fecha_hora__gte=desde, animal__isnull=False)
            .values_list("animal_id", flat=True)
            .distinct()
        )
        animales_sin_lectura = (
            Animal.objects.filter(estado=Animal.Estado.ACTIVO)
            .exclude(id__in=animales_con_lectura)
            .count()
        )
        alertas_stock = Alimento.objects.filter(stock_actual__lt=F("stock_minimo"))
        ultimos_eventos = EventoAnimal.objects.select_related(
            "animal", "usuario_responsable"
        ).order_by("-fecha")[:10]
        ocupacion_lotes = Lote.objects.select_related("tipo_alimento_actual").all()
        ultimas_lecturas = LecturaRFID.objects.select_related(
            "animal", "ubicacion_lote"
        ).order_by("-fecha_hora")[:8]

        data = {
            "animales_activos": animales_activos,
            "animales_sin_lectura": animales_sin_lectura,
            "dias_sin_lectura": dias,
            "alertas_stock": AlimentoSerializer(alertas_stock, many=True).data,
            "ultimos_eventos": EventoAnimalSerializer(ultimos_eventos, many=True).data,
            "ocupacion_lotes": LoteSerializer(ocupacion_lotes, many=True).data,
            "ultimas_lecturas": LecturaRFIDSerializer(ultimas_lecturas, many=True).data,
        }
        return Response(data)
