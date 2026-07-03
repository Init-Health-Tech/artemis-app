#!/usr/bin/env python3
"""Asigna puertos libres para Docker Compose sin pisar servicios existentes."""

from __future__ import annotations

import socket
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENV_EXAMPLE = ROOT / ".env.docker.example"
ENV_OUT = ROOT / ".env.docker"


def is_port_free(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind((host, port))
            return True
        except OSError:
            return False


def find_free_port(preferred: int, host: str = "127.0.0.1") -> int:
    if is_port_free(preferred, host):
        return preferred
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind((host, 0))
        return sock.getsockname()[1]


def parse_env(path: Path) -> dict[str, str]:
    data: dict[str, str] = {}
    if not path.exists():
        return data
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        data[key.strip()] = value.strip()
    return data


def int_or(value: str | None, default: int) -> int:
    try:
        return int(value) if value else default
    except ValueError:
        return default


PORT_KEYS = [
    ("ARTEMIS_HTTP_PORT", 18080),
    ("ARTEMIS_DEV_BACKEND_PORT", 18000),
    ("ARTEMIS_DEV_FRONTEND_PORT", 13000),
    ("ARTEMIS_DEV_DB_PORT", 15432),
    ("ARTEMIS_DEV_REDIS_PORT", 16379),
    ("ARTEMIS_DEV_MAILHOG_SMTP_PORT", 11025),
    ("ARTEMIS_DEV_MAILHOG_UI_PORT", 18025),
]


def main() -> None:
    base = parse_env(ENV_OUT) or parse_env(ENV_EXAMPLE)
    domain = base.get("ARTEMIS_DOMAIN", "artemis.init.com.mx")

    resolved: dict[str, str] = dict(base)
    for key, default in PORT_KEYS:
        preferred = int_or(base.get(key), default)
        port = find_free_port(preferred)
        resolved[key] = str(port)

    http_port = int(resolved["ARTEMIS_HTTP_PORT"])
    if http_port == 80:
        resolved["ARTEMIS_PUBLIC_URL"] = f"http://{domain}"
    else:
        resolved["ARTEMIS_PUBLIC_URL"] = f"http://{domain}:{http_port}"

    csrf_origins = {
        f"http://{domain}",
        "http://localhost",
        "http://127.0.0.1",
    }
    if http_port != 80:
        csrf_origins.update(
            {
                f"http://{domain}:{http_port}",
                f"http://localhost:{http_port}",
                f"http://127.0.0.1:{http_port}",
            }
        )
    resolved["CSRF_TRUSTED_ORIGINS"] = ",".join(sorted(csrf_origins))
    resolved["ALLOWED_HOSTS"] = f"localhost,127.0.0.1,{domain},app"

    lines = [
        "# Generado por scripts/resolve-docker-ports.py — no editar a mano si usas docker-demo-up.sh",
        "",
    ]
    for key, value in resolved.items():
        lines.append(f"{key}={value}")

    ENV_OUT.write_text("\n".join(lines) + "\n")
    print(f"Escrito {ENV_OUT}")
    for key, default in PORT_KEYS:
        preferred = int_or(base.get(key), default)
        chosen = int(resolved[key])
        note = "" if chosen == preferred else f" (preferido {preferred} ocupado)"
        print(f"  {key}={chosen}{note}")
    print(f"  URL demo: {resolved['ARTEMIS_PUBLIC_URL']}")


if __name__ == "__main__":
    main()
