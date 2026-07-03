# ArtemisApp — Descripción del sistema

> Documento de contexto para asistentes de IA (Claude, etc.). Describe qué existe hoy, qué falta, y el dominio de negocio.  
> **Objetivo:** que puedas analizar el sistema y sugerir mejoras priorizadas para un producto de gestión ganadera bovina en México.

---

## ¿Qué es ArtemisApp?

**ArtemisApp** es un MVP web para **control de ganado bovino** en operaciones de rancho / engorda / trazabilidad básica. Está pensado como demo funcional para clientes del sector agropecuario.

**Usuario objetivo:** administrador de rancho, vaquero de campo, veterinario (futuro).  
**Idioma de la UI:** español (México).  
**Estado actual:** MVP demo — funcional end-to-end, no producción.

---

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Backend | Django 5 + Django REST Framework |
| Base de datos | PostgreSQL (Docker) / SQLite (local) |
| Frontend | React 19 + TypeScript + Tailwind CSS 4 |
| Bundling | Webpack (servido por Django en `:8000`) |
| Auth | Django session + un superusuario admin |
| Infra local | Docker Compose (db, backend, frontend, redis, rabbitmq, celery, mailhog) |
| Admin | Django Admin con import/export |
| API docs | drf-spectacular (Swagger/ReDoc) |

**Repo:** `artemis-app`  
**App Django principal de negocio:** `ganado`  
**Proyecto Django:** `artemis`

---

## Módulos y pantallas (frontend)

| Ruta | Módulo | Qué hace |
|------|--------|----------|
| `/login` | Auth | Login con email/contraseña |
| `/` | Dashboard | KPIs, ocupación de lotes, alertas stock, eventos y lecturas RFID recientes |
| `/animales` | Animales | Listado con filtros (lote, estado, especie, búsqueda) |
| `/animales/nuevo` | Animales | Alta de animal (RFID prellenable desde escáner) |
| `/animales/:id` | Animales | Ficha + timeline eventos/RFID + registro rápido de eventos |
| `/animales/:id/editar` | Animales | Edición |
| `/rfid` | RFID | Simulador de escaneo + historial de lecturas |
| `/lotes` | Lotes | Tarjetas con ocupación % |
| `/lotes/nuevo`, `/lotes/:id/editar` | Lotes | Crear/editar potrero |
| `/lotes/:id` | Lotes | Detalle con animales activos del lote |
| `/inventario` | Inventario | Alimentos, alertas stock bajo, movimientos entrada/consumo |

**Diseño:** basado en design system Stitch (`stitch_agrotrace_enterprise_saas/`) — dark mode, verde INIT Core, tipografía Inter.

---

## Modelos de datos

### `Animal`
- `rfid_tag` (único), `numero_interno`, `especie` (bovino/otro)
- `raza`, `sexo`, `fecha_nacimiento`, `peso_actual`
- `lote` (FK), `estado` (activo, vendido, muerto, cuarentena)
- `fecha_registro`

### `Lote` (potrero/corral)
- `nombre`, `capacidad`, `ubicacion`
- `tipo_alimento_actual` (FK a Alimento, nullable)
- Propiedades calculadas: `animales_activos_count`, `capacidad_usada_pct`

### `EventoAnimal` (historial sanitario/operativo)
- Tipos: vacunación, enfermedad, tratamiento, parto, inseminación, venta, traslado, muerte, revisión, pesaje
- `fecha`, `descripcion`, `valor_numerico` (nullable, usado en pesajes)
- `usuario_responsable` (FK User)

### `Alimento` (inventario)
- `nombre`, `tipo` (forraje, concentrado, suplemento)
- `stock_actual`, `stock_minimo`, `costo_unitario`, `fecha_ultima_entrada`
- Propiedad: `stock_bajo` (stock < mínimo)

### `MovimientoAlimento`
- `tipo` (entrada/consumo), `cantidad`, `fecha`, `notas`
- Actualiza `stock_actual` del alimento vía signal

### `LecturaRFID`
- `rfid_tag_leido`, `animal` (FK nullable), `fecha_hora`
- `ubicacion_lote` (FK) + `ubicacion_texto`
- `procesado` (bool)

---

## Reglas de negocio automatizadas (signals)

| Evento / acción | Efecto automático |
|-----------------|-------------------|
| Evento tipo `pesaje` con `valor_numerico` | Actualiza `animal.peso_actual` |
| Evento tipo `venta` | Cambia `animal.estado` → `vendido` |
| Evento tipo `muerte` | Cambia `animal.estado` → `muerto` |
| `MovimientoAlimento` entrada | Suma stock + actualiza `fecha_ultima_entrada` |
| `MovimientoAlimento` consumo | Resta stock |

**No automatizado aún:**
- Evento `traslado` no cambia el `lote` del animal
- Cuarentena no se activa automáticamente por evento de enfermedad
- Lectura RFID no crea evento ni actualiza ubicación del animal

---

## API REST (`/api/`)

| Endpoint | Métodos | Descripción |
|----------|---------|-------------|
| `/api/auth/login/` | POST | Login sesión |
| `/api/auth/logout/` | POST | Cerrar sesión |
| `/api/auth/session/` | GET | Estado de sesión + CSRF cookie |
| `/api/dashboard/` | GET | KPIs, lotes, eventos, lecturas, alertas stock |
| `/api/animales/` | CRUD | Filtros: `?lote=&estado=&especie=&search=` |
| `/api/animales/{id}/eventos/` | POST | Registrar evento en animal |
| `/api/lotes/` | CRUD | Lotes/potreros |
| `/api/alimentos/` | CRUD | Inventario |
| `/api/alimentos/{id}/movimiento/` | POST | Entrada o consumo de stock |
| `/api/alimentos/{id}/movimientos/` | GET | Historial movimientos (últimos 20) |
| `/api/eventos/` | CRUD | Eventos globales |
| `/api/rfid/` | GET, POST | Listado y creación de lecturas |
| `/api/rfid/escanear/` | POST | Simular escaneo RFID |
| `/api/users/` | CRUD | Usuarios (boilerplate, poco usado en UI) |

**Auth API:** `SessionAuthentication` — requiere cookie de sesión + CSRF en POST/PATCH/DELETE.

---

## Django Admin

Todos los modelos de `ganado` están registrados con **django-import-export** para carga masiva desde Excel/CSV.

- URL: `http://localhost:8000/admin/`
- Credenciales demo: `admin@artemis.local` / `admin123`

---

## Datos de demo

Comando:
```bash
docker compose run --rm backend python manage.py seed_ganado --force
```

Carga aproximadamente:
- 1 superusuario admin
- 4 alimentos (Melaza con stock bajo mínimo → alerta)
- 3 lotes (Potrero Norte, Corral Maternidad, Lote Engorda)
- 23 animales con razas variadas
- Eventos históricos en español (vacunas, tratamientos, pesajes)
- Lecturas RFID recientes
- Movimientos de inventario

**Tags RFID de prueba:**
- `RFID-1001` → animal registrado (BOV-001)
- `RFID-DEMO-NEW` → tag no registrado (flujo de alta)

---

## Lo que SÍ tiene el sistema hoy

- [x] CRUD animales con ficha e historial
- [x] Simulador RFID end-to-end (identificar / registrar nuevo)
- [x] CRUD lotes con ocupación visual
- [x] Inventario con alertas y movimientos
- [x] Dashboard ejecutivo básico
- [x] Timeline trazabilidad simple (eventos + RFID en ficha animal)
- [x] Filtros y búsqueda de animales
- [x] Toasts, estados vacíos, banner demo
- [x] Seed reseteable con `--force`
- [x] API documentada (Swagger)

---

## Lo que NO tiene (explícitamente fuera del MVP)

- Multi-usuario con roles (vaquero, vet, admin)
- Predicciones con IA / analytics avanzados
- Gráficas de peso, sparklines, mapas del rancho
- Trazabilidad visual completa (timeline tipo cadena de custodia)
- Finanzas (costos por animal, ROI engorda, ventas)
- Integración con lector RFID físico
- App móvil / modo offline
- Genealogía (madre/padre)
- Fotos de animales
- Notificaciones push / email de alertas
- Exportación CSV/PDF
- Multi-rancho / multi-tenant
- Permisos granulares por módulo
- SINIGA / certificación oficial México

---

## Diseños de referencia (Stitch, no implementados)

En `stitch_agrotrace_enterprise_saas/` hay mockups HTML para módulos futuros:

| Carpeta | Módulo diseñado |
|---------|-----------------|
| `executive_dashboard/` | Dashboard con más KPIs y gráficas |
| `animal_profile/` | Ficha animal rica (peso, genealogía, foto) |
| `rfid_field_scanning/` | Escaneo de campo mobile-first |
| `inventory_resources/` | Inventario avanzado |
| `full_traceability_view/` | Timeline trazabilidad completa |
| `analytics_predictions/` | Predicciones IA salud/engorda |

---

## Contexto de negocio (México)

- Operaciones típicas: engorda, cría, doble propósito
- Identificación: arete interno + RFID
- Unidades: peso en kg, alimento en kg
- Eventos sanitarios obligatorios: vacunación, desparasitación, revisiones
- Alertas críticas: stock bajo, animales sin lectura RFID, sobrepoblación de potrero
- Cuarentena sanitaria relevante (SENASICA / trazabilidad futura)

---

## Archivos clave del código

```
backend/ganado/
  models.py          # Modelos de dominio
  views.py           # API ViewSets
  serializers.py     # DRF serializers
  signals.py         # Automatizaciones peso/estado/stock
  admin.py           # Django admin
  management/commands/seed_ganado.py

frontend/js/
  pages/             # Pantallas React
  api/ganado.ts      # Cliente API axios
  components/        # Layout, Toast, DemoBanner, EmptyState
  constants/labels.ts # Etiquetas español

DEMO_CHECKLIST.md    # Roadmap detallado con checkboxes
docker-compose.yml   # Infra local
```

---

## Prompt sugerido para Claude

Copia y pega esto en Claude junto con este archivo:

---

> Eres consultor de producto para software ganadero en México. Acabas de leer la descripción completa de **ArtemisApp** (MVP de control bovino).
>
> **Tu tarea:**
> 1. Identifica las **5 funcionalidades de mayor impacto** que faltan para convertir este MVP en una demo convincente para un cliente ganadero (rancho mediano, 200–500 cabezas).
> 2. Para cada una: describe el **problema de negocio**, la **solución propuesta**, **esfuerzo estimado** (bajo/medio/alto), y si encaja en el diseño Stitch existente.
> 3. Sugiere **3 flujos de demo** de 10 minutos que muestren valor real (no solo CRUD).
> 4. Señala **deuda técnica** que debería resolverse antes de escalar.
> 5. Propón **métricas/KPIs adicionales** para el dashboard que un dueño de rancho usaría semanalmente.
>
> **Restricciones:** sin IA en fase 1, un solo usuario admin por ahora, presupuesto de desarrollo limitado (1–2 semanas más).
>
> Responde en español, con prioridad clara (P0, P1, P2).

---

## Cómo levantar el sistema

### Desarrollo (hot-reload, puertos sin conflictos)

```bash
./scripts/docker-dev-up.sh
```

Puertos por defecto (se autoajustan si están ocupados): backend **18000**, frontend **13000**, Postgres **15432**.

### Demo productivo (dominio `artemis.init.com.mx`)

```bash
./scripts/docker-demo-up.sh
```

1. Agrega a `/etc/hosts`: `127.0.0.1 artemis.init.com.mx`
2. Abre la URL que imprime el script (ej. `http://artemis.init.com.mx:18080`)
3. Login demo: `demo@artemis.local` / `demo123`

Puertos y dominio se configuran en `.env.docker` (copia desde `.env.docker.example`).

### Migraciones y seed (dev)

```bash
docker compose --env-file .env.docker run --rm backend python manage.py migrate
docker compose --env-file .env.docker run --rm backend python manage.py seed_ganado --force
```

- App dev: http://localhost:18000 (o el puerto asignado)
- Admin: `/admin/`
- API Swagger: `/api/schema/swagger-ui/`

---

*Última actualización: MVP demo con 23 animales, 6 modelos, 7 módulos UI.*
