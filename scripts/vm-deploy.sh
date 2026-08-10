#!/usr/bin/env bash
# Deploy / actualización del API en la VM.
# Uso (en la máquina):
#   cd /opt/artemis-app && ./scripts/vm-deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.demo.yml}"
ENV_FILE="${ENV_FILE:-.env.docker}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Falta $ENV_FILE. Copia .env.docker.example y ajusta secretos/dominios."
  exit 1
fi

echo "==> git fetch / reset a origin/main"
git fetch origin main
git checkout main
git reset --hard origin/main

echo "==> docker compose up -d --build"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build --remove-orphans

echo "==> estado"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

echo "Deploy OK"
