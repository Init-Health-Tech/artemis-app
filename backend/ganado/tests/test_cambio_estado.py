from django.core.exceptions import ValidationError

from django.test import TestCase

from ganado.models import Animal, EventoAnimal, Lote
from ganado.services.cambio_estado import (
    PREFIJO_CAMBIO_ESTADO,
    cambiar_estado_animal,
    puede_transicionar,
)
from ganado.tests.test_signals import User


class CambioEstadoTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="estado@test.com", password="test")
        self.lote = Lote.objects.create(nombre="Lote Test", capacidad=10, ubicacion="A")
        self.animal = Animal.objects.create(
            rfid_tag="RFID-ESTADO",
            numero_interno="EST-001",
            sexo=Animal.Sexo.MACHO,
            lote=self.lote,
            estado=Animal.Estado.ACTIVO,
        )

    def test_activo_a_cuarentena(self):
        resultado = cambiar_estado_animal(
            self.animal, Animal.Estado.CUARENTENA, "Fiebre detectada", self.user
        )
        self.animal.refresh_from_db()
        self.assertEqual(resultado["estado_nuevo"], Animal.Estado.CUARENTENA)
        self.assertEqual(self.animal.estado, Animal.Estado.CUARENTENA)
        self.assertTrue(
            EventoAnimal.objects.filter(
                animal=self.animal, descripcion__startswith=PREFIJO_CAMBIO_ESTADO
            ).exists()
        )

    def test_cuarentena_a_activo(self):
        self.animal.estado = Animal.Estado.CUARENTENA
        self.animal.save()
        cambiar_estado_animal(self.animal, Animal.Estado.ACTIVO, "Recuperado", self.user)
        self.animal.refresh_from_db()
        self.assertEqual(self.animal.estado, Animal.Estado.ACTIVO)

    def test_vendido_es_final(self):
        self.animal.estado = Animal.Estado.VENDIDO
        self.animal.save()
        self.assertFalse(puede_transicionar(self.animal.estado, Animal.Estado.ACTIVO))

    def test_venta_crea_evento(self):
        cambiar_estado_animal(self.animal, Animal.Estado.VENDIDO, "Remate regional", self.user)
        self.animal.refresh_from_db()
        self.assertEqual(self.animal.estado, Animal.Estado.VENDIDO)
        self.assertTrue(
            EventoAnimal.objects.filter(animal=self.animal, tipo=EventoAnimal.Tipo.VENTA).exists()
        )

    def test_transicion_invalida(self):
        with self.assertRaises(ValidationError):
            cambiar_estado_animal(self.animal, Animal.Estado.ACTIVO, "Sin cambio", self.user)
