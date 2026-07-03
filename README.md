# ArtemisApp — Control de Ganado Bovino (MVP)

Webapp para gestión de ganado bovino: animales, RFID, lotes/potreros, alimentación e inventario básico.

**Stack:** Django + DRF + React (Vite/Webpack) + PostgreSQL + Docker Compose

## Guía rápida

Ver **[SISTEMA.md](./SISTEMA.md)** para descripción completa del producto (ideal para compartir con Claude y pedir sugerencias).  
Ver **[DEMO_CHECKLIST.md](./DEMO_CHECKLIST.md)** para el roadmap de la demo y guía de presentación al cliente (15 min).

## Inicio rápido con Docker

```bash
# 1. Configurar entorno
cp backend/.env.example backend/.env
# Editar backend/.env y descomentar:
# DATABASE_URL=postgres://artemis:password@db:5432/artemis

# 2. Levantar servicios
docker compose up -d --build

# 3. Migraciones y datos de ejemplo
docker compose run --rm backend python manage.py migrate
docker compose run --rm backend python manage.py seed_ganado
```

Acceder a:
- **App:** http://localhost:8000
- **Admin Django:** http://localhost:8000/admin/
- **API Swagger:** http://localhost:8000/api/schema/swagger-ui/

## Credenciales

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin (app + Django admin) | `admin@artemis.local` | `admin123` |

## Desarrollo local (sin Docker)

```bash
cp backend/artemis/settings/local.py.example backend/artemis/settings/local.py
cp backend/.env.example backend/.env
# Usar SQLite: DATABASE_URL=sqlite:///db.sqlite3

cd backend
poetry install
poetry run python manage.py migrate
poetry run python manage.py seed_ganado
poetry run python manage.py runserver

# En otra terminal (raíz del proyecto):
pnpm install
pnpm run dev
```

App en http://localhost:8000

## Módulos

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Dashboard | `/` | KPIs, alertas de stock, últimos eventos |
| Animales | `/animales` | CRUD con filtros, historial de eventos |
| RFID | `/rfid` | Simulador de escaneo de tags |
| Lotes | `/lotes` | Potreros con ocupación y animales |
| Inventario | `/inventario` | Alimentos, alertas de stock, movimientos |

## API REST

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/dashboard/` | GET | Resumen ejecutivo |
| `/api/animales/` | CRUD | Animales con filtros `?lote=&estado=&especie=&search=` |
| `/api/animales/{id}/eventos/` | POST | Registrar evento rápido |
| `/api/animales/{id}/trazabilidad/` | GET | Timeline unificado de eventos y RFID |
| `/api/animales/{id}/pesajes/` | GET | Serie histórica de peso |
| `/api/rfid/escanear/` | POST | Simular lectura RFID |
| `/api/lotes/` | CRUD | Lotes/potreros |
| `/api/alimentos/` | CRUD | Inventario de alimentos |
| `/api/alimentos/{id}/movimiento/` | POST | Entrada/consumo de stock |

## Signals automáticos

| Signal | Disparador | Efecto |
|--------|------------|--------|
| `actualizar_peso_en_pesaje` | Nuevo `EventoAnimal` tipo `pesaje` | Actualiza `animal.peso_actual` |
| `actualizar_peso_en_pesaje` | Nuevo evento tipo `venta` | `animal.estado` → `vendido` |
| `actualizar_peso_en_pesaje` | Nuevo evento tipo `muerte` | `animal.estado` → `muerto` |
| `actualizar_peso_en_pesaje` | Nuevo evento `enfermedad` severidad `grave` | `animal.estado` → `cuarentena` |
| `actualizar_stock_alimento` | Nuevo `MovimientoAlimento` | Suma/resta `alimento.stock_actual` |
| `aplicar_cambio_lote_por_lectura` | Escaneo RFID con lote distinto | Traslado o alta en lote + evento |

## Modelos de datos

- **Animal** — rfid_tag, numero_interno, especie, raza, sexo, peso, lote, estado, proxima_revision, foto
- **Lote** — potrero/corral con capacidad y alimento asignado
- **EventoAnimal** — historial (vacunación, pesaje, tratamiento, etc.)
- **Alimento** — inventario con stock mínimo y alertas
- **LecturaRFID** — registro de cada escaneo simulado
- **MovimientoAlimento** — entradas y consumos de stock

## Seed de datos

El comando `seed_ganado` carga:
- 1 superusuario admin
- 4 tipos de alimento (1 con stock bajo para probar alertas)
- 3 lotes/potreros
- 18 animales con eventos históricos y lecturas RFID

```bash
docker compose run --rm backend python manage.py seed_ganado
```

## Diseño

UI basada en el design system **INIT Core** de Stitch (`stitch_agrotrace_enterprise_saas/`) — dark mode, paleta verde agrícola, tipografía Inter.
