#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONF_SRC="${ROOT}/docker/nginx/artemis.init.com.mx.conf"
CONF_DST="/etc/nginx/sites-available/artemis.init.com.mx"
DOMAIN="artemis.init.com.mx"

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
echo "Para HTTPS (Certbot, igual que odoo/overleaf/erp):"
echo "  certbot --nginx -d ${DOMAIN}"
echo ""
echo "Después actualiza .env.docker:"
echo "  ARTEMIS_PUBLIC_URL=https://${DOMAIN}"
echo "  CSRF_TRUSTED_ORIGINS=https://${DOMAIN},http://${DOMAIN}"
echo "  y reinicia: ./scripts/docker-demo-up.sh"
