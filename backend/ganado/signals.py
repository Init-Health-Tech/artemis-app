from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Animal, EventoAnimal, MovimientoAlimento


@receiver(post_save, sender=EventoAnimal)
def actualizar_peso_en_pesaje(sender, instance, created, **kwargs):
    if not created:
        return
    animal = instance.animal
    if instance.tipo == EventoAnimal.Tipo.PESAJE and instance.valor_numerico is not None:
        animal.peso_actual = instance.valor_numerico
        animal.save(update_fields=["peso_actual", "modified"])
    elif instance.tipo == EventoAnimal.Tipo.VENTA:
        animal.estado = Animal.Estado.VENDIDO
        animal.save(update_fields=["estado", "modified"])
    elif instance.tipo == EventoAnimal.Tipo.MUERTE:
        animal.estado = Animal.Estado.MUERTO
        animal.save(update_fields=["estado", "modified"])
    elif (
        instance.tipo == EventoAnimal.Tipo.ENFERMEDAD
        and instance.severidad == EventoAnimal.Severidad.GRAVE
    ):
        animal.estado = Animal.Estado.CUARENTENA
        animal.save(update_fields=["estado", "modified"])


@receiver(post_save, sender=MovimientoAlimento)
def actualizar_stock_alimento(sender, instance, created, **kwargs):
    if not created:
        return
    alimento = instance.alimento
    if instance.tipo == MovimientoAlimento.Tipo.ENTRADA:
        alimento.stock_actual += instance.cantidad
        alimento.fecha_ultima_entrada = instance.fecha
    else:
        alimento.stock_actual -= instance.cantidad
    alimento.save(update_fields=["stock_actual", "fecha_ultima_entrada", "modified"])
