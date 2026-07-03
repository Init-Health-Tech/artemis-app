from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import BaseCommand

from decouple import config

from ganado.models import Alimento

User = get_user_model()


class Command(BaseCommand):
    help = "Prepara entorno demo: usuarios demo/admin y datos de ejemplo"

    def handle(self, *args, **options):
        demo_email = config("DEMO_USER_EMAIL", default="demo@artemis.local")
        demo_password = config("DEMO_USER_PASSWORD", default="demo123")
        admin_email = config("DEMO_ADMIN_EMAIL", default="admin@artemis.local")
        admin_password = config("DEMO_ADMIN_PASSWORD", default="admin123")

        demo_user, demo_created = User.objects.get_or_create(
            email=demo_email,
            defaults={"is_staff": False, "is_superuser": False, "is_active": True},
        )
        demo_user.set_password(demo_password)
        demo_user.is_active = True
        demo_user.save()

        admin_user, admin_created = User.objects.get_or_create(
            email=admin_email,
            defaults={"is_staff": True, "is_superuser": True, "is_active": True},
        )
        admin_user.set_password(admin_password)
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.save()

        seed_force = config("DEMO_SEED_FORCE", default=False, cast=bool)
        if seed_force or not Alimento.objects.exists():
            call_command("seed_ganado", force=seed_force)

        self.stdout.write(self.style.SUCCESS("=== ArtemisApp Demo lista ==="))
        self.stdout.write(f"  App:   {demo_email} / {demo_password}")
        self.stdout.write(f"  Admin: {admin_email} / {admin_password}")
        if demo_created:
            self.stdout.write(self.style.NOTICE("  (cuenta demo creada)"))
        if admin_created:
            self.stdout.write(self.style.NOTICE("  (cuenta admin creada)"))
