#!/bin/sh
set -e

cd /home/user/app/backend

echo ">> Esperando base de datos..."
python - <<'PY'
import os
import time

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "artemis.settings.demo")
django.setup()

from django.db import connection

for attempt in range(60):
    try:
        connection.ensure_connection()
        break
    except Exception:
        time.sleep(1)
else:
    raise SystemExit("No se pudo conectar a la base de datos")
PY

echo ">> Migraciones"
python manage.py migrate --noinput

echo ">> Archivos estáticos"
python manage.py collectstatic --noinput

echo ">> Usuario demo y datos de ejemplo"
python manage.py setup_demo

echo ">> Iniciando Gunicorn"
exec gunicorn artemis.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers "${GUNICORN_WORKERS:-2}" \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
