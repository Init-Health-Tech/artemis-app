from django.core.exceptions import ValidationError

from ganado.models import Animal, EventoAnimal

ESTADOS_FINALES = {Animal.Estado.VENDIDO, Animal.Estado.MUERTO}

TRANSICIONES_PERMITIDAS: dict[str, list[str]] = {
    Animal.Estado.ACTIVO: [
        Animal.Estado.CUARENTENA,
        Animal.Estado.VENDIDO,
        Animal.Estado.MUERTO,
    ],
    Animal.Estado.CUARENTENA: [
        Animal.Estado.ACTIVO,
        Animal.Estado.VENDIDO,
        Animal.Estado.MUERTO,
    ],
    Animal.Estado.VENDIDO: [],
    Animal.Estado.MUERTO: [],
}

PREFIJO_CAMBIO_ESTADO = "[Cambio estado]"


def transiciones_desde(estado_actual: str) -> list[str]:
    return TRANSICIONES_PERMITIDAS.get(estado_actual, [])


def puede_transicionar(estado_actual: str, estado_nuevo: str) -> bool:
    if estado_actual == estado_nuevo:
        return False
    return estado_nuevo in transiciones_desde(estado_actual)


def _descripcion_cambio(estado_anterior: str, estado_nuevo: str, motivo: str) -> str:
    anterior = dict(Animal.Estado.choices).get(estado_anterior, estado_anterior)
    nuevo = dict(Animal.Estado.choices).get(estado_nuevo, estado_nuevo)
    return f"{PREFIJO_CAMBIO_ESTADO} {anterior} → {nuevo}: {motivo}"


def cambiar_estado_animal(
    animal: Animal,
    estado_nuevo: str,
    motivo: str,
    usuario,
    *,
    causa_enfermedad: bool = False,
    severidad: str = EventoAnimal.Severidad.MODERADA,
) -> dict:
    motivo = (motivo or "").strip()
    if not motivo:
        raise ValidationError("El motivo del cambio es obligatorio.")

    estado_anterior = animal.estado
    if not puede_transicionar(estado_anterior, estado_nuevo):
        raise ValidationError(
            f"No se puede cambiar de '{animal.get_estado_display()}' a "
            f"'{dict(Animal.Estado.choices).get(estado_nuevo, estado_nuevo)}'."
        )

    descripcion = _descripcion_cambio(estado_anterior, estado_nuevo, motivo)

    if estado_nuevo == Animal.Estado.VENDIDO:
        evento = EventoAnimal.objects.create(
            animal=animal,
            tipo=EventoAnimal.Tipo.VENTA,
            descripcion=descripcion,
            usuario_responsable=usuario,
        )
    elif estado_nuevo == Animal.Estado.MUERTO:
        evento = EventoAnimal.objects.create(
            animal=animal,
            tipo=EventoAnimal.Tipo.MUERTE,
            descripcion=descripcion,
            usuario_responsable=usuario,
        )
    elif estado_nuevo == Animal.Estado.CUARENTENA:
        animal.estado = Animal.Estado.CUARENTENA
        animal.save(update_fields=["estado", "modified"])
        evento = EventoAnimal.objects.create(
            animal=animal,
            tipo=EventoAnimal.Tipo.ENFERMEDAD if causa_enfermedad else EventoAnimal.Tipo.REVISION,
            descripcion=descripcion,
            severidad=severidad if causa_enfermedad else EventoAnimal.Severidad.MODERADA,
            usuario_responsable=usuario,
        )
    elif estado_nuevo == Animal.Estado.ACTIVO:
        animal.estado = Animal.Estado.ACTIVO
        animal.save(update_fields=["estado", "modified"])
        evento = EventoAnimal.objects.create(
            animal=animal,
            tipo=EventoAnimal.Tipo.REVISION,
            descripcion=descripcion,
            usuario_responsable=usuario,
        )
    else:
        raise ValidationError("Transición de estado no soportada.")

    animal.refresh_from_db()
    return {
        "animal_id": animal.pk,
        "numero_interno": animal.numero_interno,
        "estado_anterior": estado_anterior,
        "estado_nuevo": animal.estado,
        "evento_id": evento.pk,
    }


def cambiar_estado_masivo(
    animales: list[Animal],
    estado_nuevo: str,
    motivo: str,
    usuario,
    **kwargs,
) -> dict:
    exitosos = []
    errores = []
    for animal in animales:
        try:
            resultado = cambiar_estado_animal(animal, estado_nuevo, motivo, usuario, **kwargs)
            exitosos.append(resultado)
        except ValidationError as exc:
            errores.append(
                {
                    "animal_id": animal.pk,
                    "numero_interno": animal.numero_interno,
                    "error": exc.messages[0] if hasattr(exc, "messages") else str(exc),
                }
            )
    return {"exitosos": exitosos, "errores": errores, "total_exitosos": len(exitosos)}
