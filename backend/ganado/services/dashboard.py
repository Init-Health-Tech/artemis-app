from datetime import timedelta
from decimal import Decimal

from django.db.models import Avg, Count, F, Sum
from django.utils import timezone

from ganado.models import Alimento, Animal, EventoAnimal, LecturaRFID, Lote, MovimientoAlimento

TIPO_EVENTO_LABELS = {
    "vacunacion": "Vacunación",
    "enfermedad": "Enfermedad",
    "tratamiento": "Tratamiento",
    "parto": "Parto",
    "inseminacion": "Inseminación",
    "venta": "Venta",
    "traslado": "Traslado",
    "muerte": "Muerte",
    "revision": "Revisión",
    "pesaje": "Pesaje",
}

ESTADO_LABELS = {
    "activo": "Activo",
    "cuarentena": "Cuarentena",
    "vendido": "Vendido",
    "muerto": "Muerto",
}


def calcular_adg_lote(lote: Lote) -> float | None:
    animales = lote.animales.filter(estado=Animal.Estado.ACTIVO)
    adgs = []
    for animal in animales:
        pesajes = list(
            animal.eventos.filter(tipo=EventoAnimal.Tipo.PESAJE, valor_numerico__isnull=False)
            .order_by("fecha")
            .values_list("fecha", "valor_numerico")
        )
        if len(pesajes) < 2:
            continue
        first_date, first_weight = pesajes[0]
        last_date, last_weight = pesajes[-1]
        days = (last_date - first_date).days
        if days <= 0:
            continue
        adgs.append(float(last_weight - first_weight) / days)
    if not adgs:
        return None
    return round(sum(adgs) / len(adgs), 2)


def dias_stock_restante(alimento: Alimento, dias_consumo: int = 14) -> int | None:
    desde = timezone.localdate() - timedelta(days=dias_consumo)
    consumo = (
        MovimientoAlimento.objects.filter(
            alimento=alimento,
            tipo=MovimientoAlimento.Tipo.CONSUMO,
            fecha__gte=desde,
        ).aggregate(total=Sum("cantidad"))["total"]
        or Decimal("0")
    )
    if consumo <= 0:
        return None
    promedio_diario = float(consumo) / dias_consumo
    if promedio_diario <= 0:
        return None
    return int(float(alimento.stock_actual) / promedio_diario)


def construir_resumen_hato() -> dict:
    activos = Animal.objects.filter(estado=Animal.Estado.ACTIVO)
    peso_prom = activos.filter(peso_actual__isnull=False).aggregate(prom=Avg("peso_actual"))["prom"]
    total_cap = sum(l.capacidad for l in Lote.objects.all())
    total_ocup = sum(l.animales_activos_count for l in Lote.objects.all())
    lecturas_hoy = LecturaRFID.objects.filter(fecha_hora__date=timezone.localdate()).count()
    eventos_hoy = EventoAnimal.objects.filter(fecha__date=timezone.localdate()).count()

    return {
        "total_registrados": Animal.objects.count(),
        "peso_promedio_kg": round(float(peso_prom), 1) if peso_prom else None,
        "ocupacion_global_pct": round((total_ocup / total_cap) * 100, 1) if total_cap else 0,
        "capacidad_total": total_cap,
        "ocupacion_total": total_ocup,
        "lecturas_rfid_hoy": lecturas_hoy,
        "eventos_hoy": eventos_hoy,
    }


def construir_actividad_semanal() -> list[dict]:
    hoy = timezone.localdate()
    dias = []
    for offset in range(6, -1, -1):
        dia = hoy - timedelta(days=offset)
        dias.append(
            {
                "fecha": dia.isoformat(),
                "label": ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][dia.weekday()],
                "eventos": EventoAnimal.objects.filter(fecha__date=dia).count(),
                "lecturas_rfid": LecturaRFID.objects.filter(fecha_hora__date=dia).count(),
            }
        )
    return dias


def construir_distribucion_estado() -> list[dict]:
    return [
        {
            "estado": row["estado"],
            "label": ESTADO_LABELS.get(row["estado"], row["estado"]),
            "total": row["total"],
        }
        for row in Animal.objects.values("estado")
        .annotate(total=Count("id"))
        .order_by("-total")
    ]


def construir_eventos_por_tipo(dias: int = 30) -> list[dict]:
    desde = timezone.now() - timedelta(days=dias)
    return [
        {
            "tipo": row["tipo"],
            "label": TIPO_EVENTO_LABELS.get(row["tipo"], row["tipo"]),
            "total": row["total"],
        }
        for row in EventoAnimal.objects.filter(fecha__gte=desde)
        .values("tipo")
        .annotate(total=Count("id"))
        .order_by("-total")[:6]
    ]


def construir_peso_promedio_tendencia(dias: int = 60) -> list[dict]:
    desde = timezone.now() - timedelta(days=dias)
    pesajes = (
        EventoAnimal.objects.filter(
            tipo=EventoAnimal.Tipo.PESAJE,
            valor_numerico__isnull=False,
            fecha__gte=desde,
        )
        .values("fecha__date")
        .annotate(peso_promedio=Avg("valor_numerico"))
        .order_by("fecha__date")
    )
    return [
        {
            "fecha": row["fecha__date"].isoformat(),
            "peso_promedio": round(float(row["peso_promedio"]), 1),
        }
        for row in pesajes
    ]


def construir_dashboard_extra(dias_sin_lectura: int = 30) -> dict:
    desde = timezone.now() - timedelta(days=dias_sin_lectura)
    hoy = timezone.localdate()
    en_7_dias = hoy + timedelta(days=7)

    animales_cuarentena = Animal.objects.filter(estado=Animal.Estado.CUARENTENA).count()
    revisiones_pendientes = Animal.objects.filter(
        proxima_revision__isnull=False,
        proxima_revision__lte=en_7_dias,
        proxima_revision__gte=hoy,
        estado=Animal.Estado.ACTIVO,
    ).select_related("lote")

    animales_sin_lectura_qs = Animal.objects.filter(estado=Animal.Estado.ACTIVO).exclude(
        id__in=LecturaRFID.objects.filter(fecha_hora__gte=desde, animal__isnull=False)
        .values_list("animal_id", flat=True)
        .distinct()
    )

    lotes_sobrepoblados = [
        lote
        for lote in Lote.objects.all()
        if lote.capacidad and lote.animales_activos_count > lote.capacidad
    ]

    alertas_accionables = []

    for alimento in Alimento.objects.filter(stock_actual__lt=F("stock_minimo")):
        alertas_accionables.append(
            {
                "tipo": "stock_bajo",
                "severidad": "alta",
                "titulo": f"Stock bajo: {alimento.nombre}",
                "descripcion": f"{alimento.stock_actual} kg (mínimo {alimento.stock_minimo} kg)",
                "link": "/inventario",
                "link_label": "Ver inventario",
            }
        )

    for animal in animales_sin_lectura_qs[:5]:
        alertas_accionables.append(
            {
                "tipo": "sin_lectura_rfid",
                "severidad": "media",
                "titulo": f"Sin lectura RFID: {animal.numero_interno}",
                "descripcion": f"Sin escaneo en los últimos {dias_sin_lectura} días",
                "link": f"/animales/{animal.pk}",
                "link_label": "Ver animal",
            }
        )

    for lote in lotes_sobrepoblados:
        alertas_accionables.append(
            {
                "tipo": "sobrepoblacion",
                "severidad": "alta",
                "titulo": f"Sobrepoblación: {lote.nombre}",
                "descripcion": (
                    f"{lote.animales_activos_count} animales / capacidad {lote.capacidad}"
                ),
                "link": f"/lotes/{lote.pk}",
                "link_label": "Ver lote",
            }
        )

    for animal in revisiones_pendientes:
        alertas_accionables.append(
            {
                "tipo": "revision_pendiente",
                "severidad": "media",
                "titulo": f"Revisión próxima: {animal.numero_interno}",
                "descripcion": f"Programada para {animal.proxima_revision}",
                "link": f"/animales/{animal.pk}",
                "link_label": "Ver animal",
            }
        )

    for animal in Animal.objects.filter(estado=Animal.Estado.CUARENTENA).select_related("lote")[:5]:
        alertas_accionables.append(
            {
                "tipo": "cuarentena",
                "severidad": "alta",
                "titulo": f"En cuarentena: {animal.numero_interno}",
                "descripcion": animal.lote.nombre if animal.lote else "Sin lote asignado",
                "link": f"/animales/{animal.pk}",
                "link_label": "Ver animal",
            }
        )

    adg_por_lote = []
    for lote in Lote.objects.all():
        adg = calcular_adg_lote(lote)
        if adg is not None:
            adg_por_lote.append({"lote_id": lote.pk, "lote_nombre": lote.nombre, "adg_kg_dia": adg})

    stock_dias = []
    for alimento in Alimento.objects.all():
        dias = dias_stock_restante(alimento)
        if dias is not None:
            stock_dias.append(
                {
                    "alimento_id": alimento.pk,
                    "nombre": alimento.nombre,
                    "dias_restantes": dias,
                    "stock_bajo": alimento.stock_bajo,
                }
            )

    return {
        "animales_cuarentena": animales_cuarentena,
        "revisiones_pendientes_count": revisiones_pendientes.count(),
        "lotes_sobrepoblados_count": len(lotes_sobrepoblados),
        "alertas_accionables": alertas_accionables,
        "alertas_activas_count": len(alertas_accionables),
        "adg_por_lote": adg_por_lote,
        "stock_dias_restantes": stock_dias,
        "revisiones_pendientes": [
            {
                "animal_id": a.pk,
                "numero_interno": a.numero_interno,
                "proxima_revision": str(a.proxima_revision),
                "lote_nombre": a.lote.nombre if a.lote else None,
            }
            for a in revisiones_pendientes
        ],
        "resumen_hato": construir_resumen_hato(),
        "actividad_semanal": construir_actividad_semanal(),
        "distribucion_estado": construir_distribucion_estado(),
        "eventos_por_tipo": construir_eventos_por_tipo(),
        "peso_promedio_tendencia": construir_peso_promedio_tendencia(),
    }
