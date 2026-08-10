#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONF_SRC="${ROOT}/docker/nginx/api.artemis.init.com.mx.conf"
CONF_DST="/etc/nginx/sites-available/api.artemis.init.com.mx"
DOMAIN="api.artemis.init.com.mx"
FRONTEND="artemis.init.com.mx"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Ejecuta con sudo: sudo $0"
  exit 1
fi

cp "$CONF_SRC" "$CONF_DST"
ln -sf "$CONF_DST" "/etc/nginx/sites-enabled/${DOMAIN}"

nginx -t
systemctl reload nginx

echo ""
echo "Nginx configurado para ${DOMAIN} -> 127.0.0.1:18080"
echo ""
echo "Para HTTPS (Certbot):"
echo "  certbot --nginx -d ${DOMAIN}"
echo ""
echo "Después actualiza .env.docker:"
echo "  ARTEMIS_DOMAIN=${DOMAIN}"
echo "  ARTEMIS_PUBLIC_URL=https://${DOMAIN}"
echo "  FRONTEND_BASE_URL=https://${FRONTEND}"
echo "  CORS_ALLOWED_ORIGINS=https://${FRONTEND}"
echo "  CSRF_TRUSTED_ORIGINS=https://${DOMAIN},https://${FRONTEND}"
echo "  y reinicia: ./scripts/docker-demo-up.sh"
