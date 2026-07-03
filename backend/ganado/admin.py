from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

from .models import Alimento, Animal, EventoAnimal, LecturaRFID, Lote, MovimientoAlimento


@admin.register(Alimento)
class AlimentoAdmin(ImportExportModelAdmin):
    list_display = (
        "nombre",
        "tipo",
        "stock_actual",
        "stock_minimo",
        "costo_unitario",
        "fecha_ultima_entrada",
    )
    list_filter = ("tipo",)
    search_fields = ("nombre",)


@admin.register(Lote)
class LoteAdmin(ImportExportModelAdmin):
    list_display = ("nombre", "capacidad", "ubicacion", "tipo_alimento_actual", "animales_activos_count")
    list_filter = ("tipo_alimento_actual",)
    search_fields = ("nombre", "ubicacion")


class EventoAnimalInline(admin.TabularInline):
    model = EventoAnimal
    extra = 0
    fields = ("tipo", "fecha", "descripcion", "valor_numerico", "severidad", "usuario_responsable")
    readonly_fields = ("created",)


@admin.register(Animal)
class AnimalAdmin(ImportExportModelAdmin):
    list_display = (
        "numero_interno",
        "rfid_tag",
        "especie",
        "raza",
        "sexo",
        "peso_actual",
        "lote",
        "estado",
        "fecha_registro",
        "proxima_revision",
    )
    list_filter = ("estado", "especie", "sexo", "lote")
    search_fields = ("numero_interno", "rfid_tag", "raza")
    inlines = [EventoAnimalInline]


@admin.register(EventoAnimal)
class EventoAnimalAdmin(ImportExportModelAdmin):
    list_display = ("animal", "tipo", "fecha", "valor_numerico", "usuario_responsable")
    list_filter = ("tipo", "fecha")
    search_fields = ("animal__numero_interno", "animal__rfid_tag", "descripcion")
    date_hierarchy = "fecha"


@admin.register(LecturaRFID)
class LecturaRFIDAdmin(ImportExportModelAdmin):
    list_display = (
        "rfid_tag_leido",
        "animal",
        "fecha_hora",
        "ubicacion_lote",
        "ubicacion_texto",
        "procesado",
    )
    list_filter = ("procesado", "fecha_hora", "ubicacion_lote")
    search_fields = ("rfid_tag_leido", "animal__numero_interno")
    date_hierarchy = "fecha_hora"


@admin.register(MovimientoAlimento)
class MovimientoAlimentoAdmin(ImportExportModelAdmin):
    list_display = ("alimento", "tipo", "cantidad", "fecha", "notas")
    list_filter = ("tipo", "fecha")
    search_fields = ("alimento__nombre", "notas")
    date_hierarchy = "fecha"
