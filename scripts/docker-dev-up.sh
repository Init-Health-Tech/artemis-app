#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.docker ]]; then
  cp .env.docker.example .env.docker
fi

python3 scripts/resolve-docker-ports.py

set -a
# shellcheck disable=SC1091
source .env.docker
set +a

echo ""
echo "=== ArtemisApp Desarrollo ==="
echo "  Backend:  http://localhost:${ARTEMIS_DEV_BACKEND_PORT}"
echo "  Frontend: http://localhost:${ARTEMIS_DEV_FRONTEND_PORT}"
echo "  (No usa ${ARTEMIS_DOMAIN} — stack dev con hot-reload)"
echo ""

docker compose --env-file .env.docker up -d --build "$@"
