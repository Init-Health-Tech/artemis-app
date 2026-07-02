from ganado.models import Animal, EventoAnimal, Lote


def aplicar_cambio_lote_por_lectura(animal, lote_destino: Lote | None, usuario):
    """
    Si la lectura RFID ocurre en un lote distinto al actual del animal,
    actualiza animal.lote y registra el evento correspondiente.

    Retorna dict con info del cambio para la respuesta API.
    """
    sin_cambio = {
        "hubo_cambio_lote": False,
        "lote_anterior": None,
        "lote_nuevo": None,
        "tipo_movimiento": None,
    }
    if lote_destino is None:
        return sin_cambio

    lote_anterior = animal.lote
    if lote_anterior_id := getattr(lote_anterior, "pk", None):
        if lote_anterior_id == lote_destino.pk:
            return sin_cambio
    elif lote_destino.pk is None:
        return sin_cambio

    if lote_anterior is None:
        descripcion = f"Alta en lote {lote_destino.nombre} vía lectura RFID"
        tipo_evento = EventoAnimal.Tipo.REVISION
        tipo_movimiento = "alta"
    else:
        descripcion = (
            f"Trasladado de {lote_anterior.nombre} a {lote_destino.nombre} vía lectura RFID"
        )
        tipo_evento = EventoAnimal.Tipo.TRASLADO
        tipo_movimiento = "traslado"

    EventoAnimal.objects.create(
        animal=animal,
        tipo=tipo_evento,
        descripcion=descripcion,
        usuario_responsable=usuario,
    )
    animal.lote = lote_destino
    animal.save(update_fields=["lote", "modified"])

    return {
        "hubo_cambio_lote": True,
        "lote_anterior": _lote_resumen(lote_anterior),
        "lote_nuevo": _lote_resumen(lote_destino),
        "tipo_movimiento": tipo_movimiento,
    }


def _lote_resumen(lote: Lote | None):
    if lote is None:
        return None
    return {"id": lote.pk, "nombre": lote.nombre}
