from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from common.models import IndexedTimeStampedModel


class Alimento(IndexedTimeStampedModel):
    class Tipo(models.TextChoices):
        FORRAJE = "forraje", _("Forraje")
        CONCENTRADO = "concentrado", _("Concentrado")
        SUPLEMENTO = "suplemento", _("Suplemento")

    nombre = models.CharField(max_length=200)
    tipo = models.CharField(max_length=20, choices=Tipo.choices)
    stock_actual = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    stock_minimo = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    costo_unitario = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fecha_ultima_entrada = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["nombre"]
        verbose_name = _("Alimento")
        verbose_name_plural = _("Alimentos")

    def __str__(self):
        return self.nombre

    @property
    def stock_bajo(self):
        return self.stock_actual < self.stock_minimo


class Lote(IndexedTimeStampedModel):
    nombre = models.CharField(max_length=200)
    capacidad = models.PositiveIntegerField(help_text=_("Capacidad máxima de animales"))
    ubicacion = models.CharField(max_length=500, blank=True)
    tipo_alimento_actual = models.ForeignKey(
        Alimento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lotes",
    )

    class Meta:
        ordering = ["nombre"]
        verbose_name = _("Lote / Potrero")
        verbose_name_plural = _("Lotes / Potreros")

    def __str__(self):
        return self.nombre

    @property
    def animales_activos_count(self):
        return self.animales.filter(estado=Animal.Estado.ACTIVO).count()

    @property
    def capacidad_usada_pct(self):
        if not self.capacidad:
            return 0
        return round((self.animales_activos_count / self.capacidad) * 100, 1)


class Animal(IndexedTimeStampedModel):
    class Especie(models.TextChoices):
        BOVINO = "bovino", _("Bovino")
        OTRO = "otro", _("Otro")

    class Sexo(models.TextChoices):
        MACHO = "macho", _("Macho")
        HEMBRA = "hembra", _("Hembra")

    class Estado(models.TextChoices):
        ACTIVO = "activo", _("Activo")
        VENDIDO = "vendido", _("Vendido")
        MUERTO = "muerto", _("Muerto")
        CUARENTENA = "cuarentena", _("Cuarentena")

    rfid_tag = models.CharField(max_length=100, unique=True, verbose_name=_("Tag RFID"))
    numero_interno = models.CharField(max_length=50, verbose_name=_("Número interno"))
    especie = models.CharField(max_length=20, choices=Especie.choices, default=Especie.BOVINO)
    raza = models.CharField(max_length=100, blank=True)
    sexo = models.CharField(max_length=10, choices=Sexo.choices)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    peso_actual = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    lote = models.ForeignKey(
        Lote,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="animales",
    )
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.ACTIVO)
    fecha_registro = models.DateField(default=timezone.localdate)
    proxima_revision = models.DateField(null=True, blank=True)
    foto = models.ImageField(upload_to="animales/fotos/", null=True, blank=True)

    class Meta:
        ordering = ["numero_interno"]
        verbose_name = _("Animal")
        verbose_name_plural = _("Animales")
        indexes = [
            models.Index(fields=["estado"]),
            models.Index(fields=["lote", "estado"]),
        ]

    def __str__(self):
        return f"{self.numero_interno} ({self.rfid_tag})"


class EventoAnimal(IndexedTimeStampedModel):
    class Tipo(models.TextChoices):
        VACUNACION = "vacunacion", _("Vacunación")
        ENFERMEDAD = "enfermedad", _("Enfermedad")
        TRATAMIENTO = "tratamiento", _("Tratamiento")
        PARTO = "parto", _("Parto")
        INSEMINACION = "inseminacion", _("Inseminación")
        VENTA = "venta", _("Venta")
        TRASLADO = "traslado", _("Traslado")
        MUERTE = "muerte", _("Muerte")
        REVISION = "revision", _("Revisión")
        PESAJE = "pesaje", _("Pesaje")

    class Severidad(models.TextChoices):
        LEVE = "leve", _("Leve")
        MODERADA = "moderada", _("Moderada")
        GRAVE = "grave", _("Grave")

    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name="eventos")
    tipo = models.CharField(max_length=20, choices=Tipo.choices)
    fecha = models.DateTimeField(default=timezone.now)
    descripcion = models.TextField(blank=True)
    valor_numerico = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    severidad = models.CharField(
        max_length=10,
        choices=Severidad.choices,
        default=Severidad.MODERADA,
    )
    usuario_responsable = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="eventos_ganado",
    )

    class Meta:
        ordering = ["-fecha"]
        verbose_name = _("Evento de animal")
        verbose_name_plural = _("Eventos de animales")

    def __str__(self):
        return f"{self.get_tipo_display()} - {self.animal}"


class LecturaRFID(IndexedTimeStampedModel):
    animal = models.ForeignKey(
        Animal,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lecturas_rfid",
    )
    rfid_tag_leido = models.CharField(max_length=100)
    fecha_hora = models.DateTimeField(default=timezone.now)
    ubicacion_lote = models.ForeignKey(
        Lote,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lecturas_rfid",
    )
    ubicacion_texto = models.CharField(max_length=500, blank=True)
    procesado = models.BooleanField(default=False)

    class Meta:
        ordering = ["-fecha_hora"]
        verbose_name = _("Lectura RFID")
        verbose_name_plural = _("Lecturas RFID")

    def __str__(self):
        return f"{self.rfid_tag_leido} @ {self.fecha_hora:%Y-%m-%d %H:%M}"

    @property
    def ubicacion_lectura(self):
        if self.ubicacion_lote:
            return self.ubicacion_lote.nombre
        return self.ubicacion_texto


class MovimientoAlimento(IndexedTimeStampedModel):
    class Tipo(models.TextChoices):
        ENTRADA = "entrada", _("Entrada")
        CONSUMO = "consumo", _("Consumo")

    alimento = models.ForeignKey(Alimento, on_delete=models.CASCADE, related_name="movimientos")
    tipo = models.CharField(max_length=10, choices=Tipo.choices)
    cantidad = models.DecimalField(max_digits=12, decimal_places=2)
    fecha = models.DateField(default=timezone.localdate)
    notas = models.CharField(max_length=500, blank=True)

    class Meta:
        ordering = ["-fecha", "-created"]
        verbose_name = _("Movimiento de alimento")
        verbose_name_plural = _("Movimientos de alimento")

    def __str__(self):
        return f"{self.get_tipo_display()} {self.cantidad} kg - {self.alimento}"
