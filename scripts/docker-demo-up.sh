#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.docker ]]; then
  cp .env.docker.example .env.docker
  echo "Creado .env.docker desde .env.docker.example"
fi

python3 scripts/resolve-docker-ports.py

set -a
# shellcheck disable=SC1091
source .env.docker
set +a

echo ""
echo "=== ArtemisApp Demo ==="
echo "  1. Agrega a /etc/hosts (si aún no está):"
echo "       127.0.0.1  ${ARTEMIS_DOMAIN}"
echo "  2. Abre: ${ARTEMIS_PUBLIC_URL}"
echo "  3. Login demo: demo@artemis.local / demo123"
echo ""

docker compose -f docker-compose.demo.yml --env-file .env.docker up -d --build "$@"

echo ""
docker compose -f docker-compose.demo.yml --env-file .env.docker ps
