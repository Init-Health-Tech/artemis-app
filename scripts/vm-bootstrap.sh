#!/usr/bin/env bash
# Primera configuración del API en una VM (Ubuntu).
# Ejecutar una vez como root o con sudo:
#   curl -fsSL ... | bash
# o desde el repo:
#   sudo ./scripts/vm-bootstrap.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/artemis-app}"
REPO_URL="${REPO_URL:-git@github.com:Init-Health-Tech/artemis-app.git}"
DEPLOY_USER="${DEPLOY_USER:-$SUDO_USER}"
DEPLOY_USER="${DEPLOY_USER:-$USER}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Ejecuta con sudo: sudo $0"
  exit 1
fi

echo "==> Dependencias"
apt-get update -y
apt-get install -y ca-certificates curl git nginx

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

usermod -aG docker "$DEPLOY_USER" || true
systemctl enable --now docker

echo "==> Clonar repo en ${APP_DIR}"
if [[ ! -d "$APP_DIR/.git" ]]; then
  mkdir -p "$(dirname "$APP_DIR")"
  git clone "$REPO_URL" "$APP_DIR"
  chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"
fi

cd "$APP_DIR"

if [[ ! -f .env.docker ]]; then
  cp .env.docker.example .env.docker
  echo "Creado .env.docker — edítalo (SECRET_KEY, dominios) antes del primer deploy."
fi

chmod +x scripts/vm-deploy.sh scripts/setup-nginx-artemis.sh || true

echo ""
echo "Bootstrap listo. Siguiente:"
echo "  1. Edita ${APP_DIR}/.env.docker"
echo "  2. Como ${DEPLOY_USER}: cd ${APP_DIR} && ./scripts/vm-deploy.sh"
echo "  3. sudo ./scripts/setup-nginx-artemis.sh && certbot --nginx -d api.artemis.init.com.mx"
echo "  4. En GitHub → Settings → Secrets, agrega:"
echo "       VM_HOST, VM_USER, VM_SSH_PRIVATE_KEY, VM_APP_DIR=${APP_DIR}"
echo ""
