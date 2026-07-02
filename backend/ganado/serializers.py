from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Alimento, Animal, EventoAnimal, LecturaRFID, Lote, MovimientoAlimento

User = get_user_model()


class AlimentoSerializer(serializers.ModelSerializer):
    stock_bajo = serializers.BooleanField(read_only=True)

    class Meta:
        model = Alimento
        fields = [
            "id",
            "nombre",
            "tipo",
            "stock_actual",
            "stock_minimo",
            "costo_unitario",
            "fecha_ultima_entrada",
            "stock_bajo",
            "created",
            "modified",
        ]


class MovimientoAlimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovimientoAlimento
        fields = ["id", "alimento", "tipo", "cantidad", "fecha", "notas", "created"]


class LoteSerializer(serializers.ModelSerializer):
    animales_activos_count = serializers.IntegerField(read_only=True)
    capacidad_usada_pct = serializers.FloatField(read_only=True)
    tipo_alimento_actual_nombre = serializers.CharField(
        source="tipo_alimento_actual.nombre", read_only=True, default=None
    )

    class Meta:
        model = Lote
        fields = [
            "id",
            "nombre",
            "capacidad",
            "ubicacion",
            "tipo_alimento_actual",
            "tipo_alimento_actual_nombre",
            "animales_activos_count",
            "capacidad_usada_pct",
            "created",
            "modified",
        ]


class LoteDetailSerializer(LoteSerializer):
    animales = serializers.SerializerMethodField()

    class Meta(LoteSerializer.Meta):
        fields = LoteSerializer.Meta.fields + ["animales"]

    def get_animales(self, obj):
        animales = obj.animales.filter(estado=Animal.Estado.ACTIVO)
        return AnimalListSerializer(animales, many=True).data


class EventoAnimalSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source="get_tipo_display", read_only=True)
    usuario_email = serializers.CharField(source="usuario_responsable.email", read_only=True)
    animal_numero_interno = serializers.CharField(source="animal.numero_interno", read_only=True)

    class Meta:
        model = EventoAnimal
        fields = [
            "id",
            "animal",
            "animal_numero_interno",
            "tipo",
            "tipo_display",
            "fecha",
            "descripcion",
            "valor_numerico",
            "usuario_responsable",
            "usuario_email",
            "created",
        ]


class AnimalListSerializer(serializers.ModelSerializer):
    lote_nombre = serializers.CharField(source="lote.nombre", read_only=True, default=None)
    estado_display = serializers.CharField(source="get_estado_display", read_only=True)

    class Meta:
        model = Animal
        fields = [
            "id",
            "rfid_tag",
            "numero_interno",
            "especie",
            "raza",
            "sexo",
            "fecha_nacimiento",
            "peso_actual",
            "lote",
            "lote_nombre",
            "estado",
            "estado_display",
            "fecha_registro",
        ]


class LecturaRFIDSerializer(serializers.ModelSerializer):
    animal_numero = serializers.CharField(source="animal.numero_interno", read_only=True, default=None)
    ubicacion_lectura = serializers.CharField(read_only=True)

    class Meta:
        model = LecturaRFID
        fields = [
            "id",
            "animal",
            "animal_numero",
            "rfid_tag_leido",
            "fecha_hora",
            "ubicacion_lote",
            "ubicacion_texto",
            "ubicacion_lectura",
            "procesado",
            "created",
        ]


class AnimalDetailSerializer(AnimalListSerializer):
    eventos = EventoAnimalSerializer(many=True, read_only=True)
    lecturas_rfid = LecturaRFIDSerializer(many=True, read_only=True)

    class Meta(AnimalListSerializer.Meta):
        fields = AnimalListSerializer.Meta.fields + ["eventos", "lecturas_rfid", "created", "modified"]


class LecturaRFIDScanSerializer(serializers.Serializer):
    rfid_tag = serializers.CharField(max_length=100)
    ubicacion_lote = serializers.PrimaryKeyRelatedField(
        queryset=Lote.objects.all(), required=False, allow_null=True
    )
    ubicacion_texto = serializers.CharField(required=False, allow_blank=True, default="")


class LecturaRFIDScanResponseSerializer(serializers.Serializer):
    lectura = LecturaRFIDSerializer()
    animal = AnimalDetailSerializer(allow_null=True)
    registrado = serializers.BooleanField()
    mensaje = serializers.CharField()
    hubo_cambio_lote = serializers.BooleanField(default=False)
    lote_anterior = serializers.DictField(allow_null=True, required=False)
    lote_nuevo = serializers.DictField(allow_null=True, required=False)
    tipo_movimiento = serializers.CharField(allow_null=True, required=False)


class DashboardSerializer(serializers.Serializer):
    animales_activos = serializers.IntegerField()
    animales_sin_lectura = serializers.IntegerField()
    dias_sin_lectura = serializers.IntegerField()
    alertas_stock = AlimentoSerializer(many=True)
    ultimos_eventos = EventoAnimalSerializer(many=True)
