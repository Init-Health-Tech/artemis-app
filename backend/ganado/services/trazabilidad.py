from datetime import datetime

from django.utils import timezone

from ganado.models import Animal


def construir_trazabilidad(animal: Animal) -> list[dict]:
    items = []

    registro_dt = timezone.make_aware(datetime.combine(animal.fecha_registro, datetime.min.time()))
    items.append(
        {
            "tipo_item": "alta",
            "fecha": registro_dt.isoformat(),
            "titulo": "Alta en el sistema",
            "descripcion": f"Registro inicial — arete {animal.numero_interno}, RFID {animal.rfid_tag}",
            "icono": "add_circle",
            "metadata": {},
        }
    )

    for evento in animal.eventos.select_related("usuario_responsable").all():
        items.append(
            {
                "tipo_item": "evento",
                "fecha": evento.fecha.isoformat(),
                "titulo": evento.get_tipo_display(),
                "descripcion": evento.descripcion or "—",
                "icono": _icono_evento(evento.tipo),
                "metadata": {
                    "evento_id": evento.pk,
                    "tipo": evento.tipo,
                    "valor_numerico": str(evento.valor_numerico) if evento.valor_numerico else None,
                    "severidad": evento.severidad,
                    "usuario": evento.usuario_responsable.email if evento.usuario_responsable else None,
                },
            }
        )

    for lectura in animal.lecturas_rfid.select_related("ubicacion_lote").all():
        items.append(
            {
                "tipo_item": "rfid",
                "fecha": lectura.fecha_hora.isoformat(),
                "titulo": "Lectura RFID",
                "descripcion": (
                    f"Tag {lectura.rfid_tag_leido} — "
                    f"{lectura.ubicacion_lectura or 'ubicación no registrada'}"
                ),
                "icono": "nfc",
                "metadata": {
                    "lectura_id": lectura.pk,
                    "procesado": lectura.procesado,
                    "ubicacion": lectura.ubicacion_lectura,
                },
            }
        )

    items.sort(key=lambda x: x["fecha"], reverse=True)
    return items


def _icono_evento(tipo: str) -> str:
    return {
        "vacunacion": "vaccines",
        "enfermedad": "coronavirus",
        "tratamiento": "medication",
        "parto": "child_care",
        "inseminacion": "science",
        "venta": "sell",
        "traslado": "swap_horiz",
        "muerte": "cancel",
        "revision": "stethoscope",
        "pesaje": "scale",
    }.get(tipo, "event_note")
