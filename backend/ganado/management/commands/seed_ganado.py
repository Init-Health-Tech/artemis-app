from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from ganado.models import Alimento, Animal, EventoAnimal, LecturaRFID, Lote, MovimientoAlimento

User = get_user_model()


class Command(BaseCommand):
    help = "Carga datos de ejemplo para el módulo de ganado"

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Borra datos de ganado existentes y vuelve a cargar",
        )

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            email="admin@artemis.local",
            defaults={"is_staff": True, "is_superuser": True, "is_active": True},
        )
        if created:
            user.set_password("admin123")
            user.save()
            self.stdout.write(self.style.SUCCESS("Superusuario creado: admin@artemis.local / admin123"))

        if options["force"]:
            self.stdout.write("Borrando datos de ganado...")
            MovimientoAlimento.objects.all().delete()
            LecturaRFID.objects.all().delete()
            EventoAnimal.objects.all().delete()
            Animal.objects.all().delete()
            Lote.objects.all().delete()
            Alimento.objects.all().delete()
        elif Alimento.objects.exists():
            self.stdout.write(self.style.WARNING("Datos ya existen. Usa --force para resetear."))
            return

        alimentos_data = [
            ("Pasto ensilado", "forraje", 5000, 1000, 2.5),
            ("Concentrado 18%", "concentrado", 800, 200, 12.0),
            ("Sal mineral", "suplemento", 150, 50, 8.5),
            ("Melaza", "suplemento", 30, 100, 15.0),
        ]
        alimentos = []
        for nombre, tipo, stock, minimo, costo in alimentos_data:
            alimentos.append(
                Alimento.objects.create(
                    nombre=nombre,
                    tipo=tipo,
                    stock_actual=Decimal(str(stock)),
                    stock_minimo=Decimal(str(minimo)),
                    costo_unitario=Decimal(str(costo)),
                    fecha_ultima_entrada=timezone.localdate() - timedelta(days=7),
                )
            )

        lotes_data = [
            ("Potrero Norte", 50, "Sector A — 12 ha, pastoreo rotacional", alimentos[0]),
            ("Corral Maternidad", 20, "Sector B — partos y lactancia", alimentos[2]),
            ("Lote Engorda", 80, "Sector C — 25 ha, engorda intensiva", alimentos[1]),
        ]
        lotes = []
        for nombre, cap, ubic, alim in lotes_data:
            lotes.append(
                Lote.objects.create(
                    nombre=nombre, capacidad=cap, ubicacion=ubic, tipo_alimento_actual=alim
                )
            )

        razas = ["Angus", "Brahman", "Holstein", "Charolais", "Simmental", "Criollo"]
        estados = (
            [Animal.Estado.ACTIVO] * 20
            + [Animal.Estado.CUARENTENA]
            + [Animal.Estado.VENDIDO]
            + [Animal.Estado.MUERTO]
        )

        animales = []
        for i in range(1, 24):
            animal = Animal.objects.create(
                rfid_tag=f"RFID-{1000 + i:04d}",
                numero_interno=f"BOV-{i:03d}",
                especie=Animal.Especie.BOVINO,
                raza=razas[i % len(razas)],
                sexo=Animal.Sexo.HEMBRA if i % 3 == 0 else Animal.Sexo.MACHO,
                fecha_nacimiento=timezone.localdate() - timedelta(days=365 * (1 + i % 5)),
                peso_actual=Decimal(str(250 + i * 12)),
                lote=lotes[i % 3],
                estado=estados[i - 1],
                fecha_registro=timezone.localdate() - timedelta(days=60 - i),
            )
            animales.append(animal)

        # BOV-001 en Potrero Norte para demo de traslado RFID (escanear en otro potrero)
        animales[0].lote = lotes[0]
        animales[0].save(update_fields=["lote", "modified"])

        # Animal sin lote para demo de alta vía RFID
        sin_lote = Animal.objects.create(
            rfid_tag="RFID-SIN-LOTE",
            numero_interno="BOV-000",
            especie=Animal.Especie.BOVINO,
            raza="Criollo",
            sexo=Animal.Sexo.MACHO,
            peso_actual=Decimal("320"),
            lote=None,
            estado=Animal.Estado.ACTIVO,
            fecha_registro=timezone.localdate(),
        )
        animales.insert(0, sin_lote)

        eventos_demo = [
            (EventoAnimal.Tipo.VACUNACION, "Vacuna clostridial — refuerzo anual"),
            (EventoAnimal.Tipo.TRATAMIENTO, "Desparasitación con ivermectina 1%"),
            (EventoAnimal.Tipo.PESAJE, "Pesaje de control mensual"),
            (EventoAnimal.Tipo.REVISION, "Revisión veterinaria rutinaria"),
            (EventoAnimal.Tipo.INSEMINACION, "Inseminación artificial — toro Angus registrado"),
            (EventoAnimal.Tipo.PARTO, "Parto asistido — becerro sano"),
            (EventoAnimal.Tipo.ENFERMEDAD, "Mastitis leve — tratamiento iniciado"),
            (EventoAnimal.Tipo.TRASLADO, "Traslado a Lote Engorda por peso objetivo"),
            (EventoAnimal.Tipo.VENTA, "Venta en remate regional"),
            (EventoAnimal.Tipo.MUERTE, "Muerte por causas naturales — necropsia realizada"),
        ]

        for i, animal in enumerate(animales[:20]):
            for j, (tipo, desc) in enumerate(eventos_demo[:4]):
                EventoAnimal.objects.create(
                    animal=animal,
                    tipo=tipo,
                    fecha=timezone.now() - timedelta(days=45 - i - j * 4),
                    descripcion=desc,
                    valor_numerico=Decimal(str(280 + i * 8))
                    if tipo == EventoAnimal.Tipo.PESAJE
                    else None,
                    usuario_responsable=user,
                )

        # Eventos especiales en animales concretos (por numero_interno, no índices de lista)
        bov021 = Animal.objects.get(numero_interno="BOV-021")
        EventoAnimal.objects.create(
            animal=bov021,
            tipo=EventoAnimal.Tipo.ENFERMEDAD,
            severidad=EventoAnimal.Severidad.GRAVE,
            fecha=timezone.now() - timedelta(days=5),
            descripcion="Cuarentena sanitaria — observación por fiebre",
            usuario_responsable=user,
        )

        EventoAnimal.objects.create(
            animal=Animal.objects.get(numero_interno="BOV-022"),
            tipo=EventoAnimal.Tipo.VENTA,
            fecha=timezone.now() - timedelta(days=10),
            descripcion="Vendido a intermediario — $18,500 MXN",
            usuario_responsable=user,
        )
        EventoAnimal.objects.create(
            animal=Animal.objects.get(numero_interno="BOV-023"),
            tipo=EventoAnimal.Tipo.MUERTE,
            fecha=timezone.now() - timedelta(days=30),
            descripcion="Muerte por neumonía — descartado del hato",
            usuario_responsable=user,
        )

        for i, animal in enumerate(animales[:18]):
            LecturaRFID.objects.create(
                animal=animal,
                rfid_tag_leido=animal.rfid_tag,
                fecha_hora=timezone.now() - timedelta(hours=i * 6),
                ubicacion_lote=animal.lote,
                procesado=True,
            )

        # Lecturas recientes para demo RFID en campo
        for tag, lote, horas in [
            ("RFID-1001", lotes[0], 1),
            ("RFID-1005", lotes[1], 3),
            ("RFID-DEMO-UNKNOWN", lotes[2], 2),
        ]:
            animal = Animal.objects.filter(rfid_tag=tag).first()
            LecturaRFID.objects.create(
                animal=animal,
                rfid_tag_leido=tag,
                fecha_hora=timezone.now() - timedelta(hours=horas),
                ubicacion_lote=lote,
                ubicacion_texto="Báscula de entrada" if not animal else "",
                procesado=animal is not None,
            )

        MovimientoAlimento.objects.create(
            alimento=alimentos[0],
            tipo=MovimientoAlimento.Tipo.ENTRADA,
            cantidad=Decimal("2000"),
            fecha=timezone.localdate() - timedelta(days=3),
            notas="Entrada — fardo de pasto ensilado",
        )
        MovimientoAlimento.objects.create(
            alimento=alimentos[1],
            tipo=MovimientoAlimento.Tipo.CONSUMO,
            cantidad=Decimal("120"),
            fecha=timezone.localdate() - timedelta(days=1),
            notas="Consumo diario Lote Engorda",
        )
        MovimientoAlimento.objects.create(
            alimento=alimentos[3],
            tipo=MovimientoAlimento.Tipo.CONSUMO,
            cantidad=Decimal("15"),
            fecha=timezone.localdate(),
            notas="Suplemento melaza — ración tarde",
        )

        # Pesajes históricos para gráficas (BOV-001)
        bov001 = Animal.objects.filter(numero_interno="BOV-001").first()
        if bov001:
            for days_ago, peso in [(90, 280), (60, 310), (30, 335), (7, 360)]:
                EventoAnimal.objects.create(
                    animal=bov001,
                    tipo=EventoAnimal.Tipo.PESAJE,
                    fecha=timezone.now() - timedelta(days=days_ago),
                    descripcion="Pesaje histórico demo",
                    valor_numerico=Decimal(str(peso)),
                    usuario_responsable=user,
                )
            bov001.peso_actual = Decimal("360")
            bov001.proxima_revision = timezone.localdate() + timedelta(days=5)
            bov001.save(update_fields=["peso_actual", "proxima_revision", "modified"])

        # Revisiones próximas para alertas dashboard
        for animal in Animal.objects.filter(estado=Animal.Estado.ACTIVO)[1:4]:
            animal.proxima_revision = timezone.localdate() + timedelta(days=4)
            animal.save(update_fields=["proxima_revision", "modified"])

        # Demo sobrepoblación: reducir capacidad de Corral Maternidad
        lotes[1].capacidad = 5
        lotes[1].save(update_fields=["capacidad", "modified"])

        # Fotos placeholder para demo
        try:
            from io import BytesIO

            from django.core.files.base import ContentFile
            from PIL import Image

            for animal in Animal.objects.filter(numero_interno__in=["BOV-001", "BOV-002", "BOV-003", "BOV-004", "BOV-005"]):
                img = Image.new("RGB", (400, 300), color=(46, 90, 52))
                buffer = BytesIO()
                img.save(buffer, format="JPEG")
                animal.foto.save(f"{animal.numero_interno}.jpg", ContentFile(buffer.getvalue()), save=True)
        except ImportError:
            self.stdout.write(self.style.WARNING("Pillow no disponible, omitiendo fotos demo."))

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed completado: {len(alimentos)} alimentos, {len(lotes)} lotes, {len(animales)} animales"
            )
        )
        self.stdout.write(
            "Demo RFID: escanear RFID-1001 (BOV-001 en Potrero Norte) en otro potrero para probar traslado."
        )
