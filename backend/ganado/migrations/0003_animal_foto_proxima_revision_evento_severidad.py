from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("ganado", "0002_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="animal",
            name="foto",
            field=models.ImageField(blank=True, null=True, upload_to="animales/fotos/"),
        ),
        migrations.AddField(
            model_name="animal",
            name="proxima_revision",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="eventoanimal",
            name="severidad",
            field=models.CharField(
                choices=[("leve", "Leve"), ("moderada", "Moderada"), ("grave", "Grave")],
                default="moderada",
                max_length=10,
            ),
        ),
        migrations.AddIndex(
            model_name="animal",
            index=models.Index(fields=["estado"], name="ganado_anim_estado_idx"),
        ),
        migrations.AddIndex(
            model_name="animal",
            index=models.Index(fields=["lote", "estado"], name="ganado_anim_lote_estado_idx"),
        ),
    ]
