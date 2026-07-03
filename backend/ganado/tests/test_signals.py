from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from ganado.models import Alimento, Animal, EventoAnimal, Lote, MovimientoAlimento
from ganado.services.rfid_lote import aplicar_cambio_lote_por_lectura

User = get_user_model()


class GanadoSignalsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@test.com", password="test")
        self.lote_a = Lote.objects.create(nombre="Lote A", capacidad=10, ubicacion="A")
        self.lote_b = Lote.objects.create(nombre="Lote B", capacidad=10, ubicacion="B")
        self.animal = Animal.objects.create(
            rfid_tag="RFID-TEST",
            numero_interno="TST-001",
            sexo=Animal.Sexo.MACHO,
            lote=self.lote_a,
        )
        self.alimento = Alimento.objects.create(
            nombre="Test",
            tipo="forraje",
            stock_actual=Decimal("100"),
            stock_minimo=Decimal("10"),
        )

    def test_pesaje_actualiza_peso(self):
        EventoAnimal.objects.create(
            animal=self.animal,
            tipo=EventoAnimal.Tipo.PESAJE,
            valor_numerico=Decimal("350"),
            usuario_responsable=self.user,
        )
        self.animal.refresh_from_db()
        self.assertEqual(self.animal.peso_actual, Decimal("350"))

    def test_venta_cambia_estado(self):
        EventoAnimal.objects.create(
            animal=self.animal,
            tipo=EventoAnimal.Tipo.VENTA,
            usuario_responsable=self.user,
        )
        self.animal.refresh_from_db()
        self.assertEqual(self.animal.estado, Animal.Estado.VENDIDO)

    def test_muerte_cambia_estado(self):
        EventoAnimal.objects.create(
            animal=self.animal,
            tipo=EventoAnimal.Tipo.MUERTE,
            usuario_responsable=self.user,
        )
        self.animal.refresh_from_db()
        self.assertEqual(self.animal.estado, Animal.Estado.MUERTO)

    def test_enfermedad_grave_cuarentena(self):
        EventoAnimal.objects.create(
            animal=self.animal,
            tipo=EventoAnimal.Tipo.ENFERMEDAD,
            severidad=EventoAnimal.Severidad.GRAVE,
            usuario_responsable=self.user,
        )
        self.animal.refresh_from_db()
        self.assertEqual(self.animal.estado, Animal.Estado.CUARENTENA)

    def test_movimiento_entrada_stock(self):
        MovimientoAlimento.objects.create(
            alimento=self.alimento,
            tipo=MovimientoAlimento.Tipo.ENTRADA,
            cantidad=Decimal("50"),
        )
        self.alimento.refresh_from_db()
        self.assertEqual(self.alimento.stock_actual, Decimal("150"))

    def test_movimiento_consumo_stock(self):
        MovimientoAlimento.objects.create(
            alimento=self.alimento,
            tipo=MovimientoAlimento.Tipo.CONSUMO,
            cantidad=Decimal("30"),
        )
        self.alimento.refresh_from_db()
        self.assertEqual(self.alimento.stock_actual, Decimal("70"))

    def test_rfid_traslado_lote(self):
        result = aplicar_cambio_lote_por_lectura(self.animal, self.lote_b, self.user)
        self.animal.refresh_from_db()
        self.assertTrue(result["hubo_cambio_lote"])
        self.assertEqual(result["tipo_movimiento"], "traslado")
        self.assertEqual(self.animal.lote, self.lote_b)
        self.assertTrue(
            EventoAnimal.objects.filter(animal=self.animal, tipo=EventoAnimal.Tipo.TRASLADO).exists()
        )

    def test_rfid_alta_sin_lote_previo(self):
        self.animal.lote = None
        self.animal.save()
        result = aplicar_cambio_lote_por_lectura(self.animal, self.lote_a, self.user)
        self.animal.refresh_from_db()
        self.assertEqual(result["tipo_movimiento"], "alta")
        self.assertEqual(self.animal.lote, self.lote_a)
        self.assertTrue(
            EventoAnimal.objects.filter(animal=self.animal, tipo=EventoAnimal.Tipo.REVISION).exists()
        )
