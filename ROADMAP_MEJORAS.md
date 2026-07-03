# Roadmap de Mejoras — ArtemisApp

> Checklist de trabajo. Marcar [x] al completar. Agregar nota debajo de cada item con archivos modificados y decisiones tomadas.

## P0-1: RFID → Traslado automático de lote

- [x] Modificar signal o lógica en `views.py` de `rfid/escanear/`: si `LecturaRFID.ubicacion_lote` es distinto al `lote` actual del animal, crear `EventoAnimal` tipo `traslado` con descripción autogenerada ("Trasladado de {lote_origen} a {lote_destino} vía lectura RFID")
- [x] Actualizar `animal.lote` al nuevo lote automáticamente
- [x] Manejar caso: animal sin lote previo (primera asignación) — no debe generar evento de "traslado" sino de alta en lote
- [x] Actualizar serializer de respuesta del endpoint `/api/rfid/escanear/` para incluir `lote_anterior` y `lote_nuevo` si hubo cambio
- [x] Frontend: en `/rfid`, mostrar confirmación visual clara cuando hay traslado ("Animal movido de X → Y")
- [x] Probar manualmente: escanear RFID-1001 en un lote distinto al actual, verificar que se creó el evento y cambió el lote
- [x] Actualizar seed_ganado.py si es necesario para reflejar el nuevo comportamiento en datos demo

**Notas P0-1 (completado):**
- Lógica en `backend/ganado/services/rfid_lote.py` (`aplicar_cambio_lote_por_lectura`), invocada desde `views.py` en `escanear`.
- Sin lote previo → evento tipo `revision` con descripción "Alta en lote …"; con lote previo → evento `traslado`.
- Respuesta API incluye: `hubo_cambio_lote`, `lote_anterior`, `lote_nuevo`, `tipo_movimiento` (`traslado` | `alta`).
- Frontend: `RfidScan.tsx`, `api/ganado.ts` — banner de traslado + toast.
- Seed: BOV-001 fijado en Potrero Norte; animal `RFID-SIN-LOTE` (BOV-000) sin lote para demo de alta.

## P0-2: Trazabilidad visual completa

- [x] Revisar diseño de referencia en `stitch_agrotrace_enterprise_saas/full_traceability_view/`
- [x] Crear endpoint `/api/animales/{id}/trazabilidad/` que devuelva eventos + lecturas RFID + cambios de lote ordenados cronológicamente en un solo payload unificado
- [x] Crear página `/animales/:id/trazabilidad` (o sección dentro de la ficha existente) con componente de timeline visual (usar iconos distintos por tipo de evento)
- [x] Incluir en el timeline: alta, vacunaciones, tratamientos, pesajes, traslados, lecturas RFID relevantes, venta/muerte si aplica
- [x] Agregar botón "Ver trazabilidad completa" desde la ficha del animal
- [x] Probar con animal que tenga historial variado (usar BOV-001 del seed)

**Notas P0-2 (completado):**
- Backend: `services/trazabilidad.py`, acción `trazabilidad` en `AnimalViewSet`.
- Frontend: `pages/Trazabilidad.tsx`, `components/TraceabilityTimeline.tsx`, ruta en `routes/index.ts`, botón en `AnimalDetail.tsx`.

## P0-3: Cuarentena automática y alertas accionables

- [x] Definir en signals: si se crea `EventoAnimal` tipo `enfermedad` con severidad alta (agregar campo `severidad` a EventoAnimal si no existe: leve/moderada/grave), cambiar `animal.estado` → `cuarentena`
- [x] Migración para el nuevo campo `severidad` en EventoAnimal (default: moderada, para no romper datos existentes)
- [x] Actualizar formulario de registro rápido de eventos en frontend para incluir selector de severidad cuando el tipo es "enfermedad"
- [x] Dashboard: sección de alertas accionables (no solo números) — cada alerta debe tener link directo a la ficha del animal o lote correspondiente
- [x] Agregar alerta de "sobrepoblación de lote" (capacidad_usada_pct > 100%) si no existe ya
- [x] Probar: crear evento de enfermedad grave, verificar que el animal pasa a cuarentena y aparece en alertas del dashboard

**Notas P0-3 (completado):**
- Migración `0003_animal_foto_proxima_revision_evento_severidad.py`.
- Signal en `signals.py` para enfermedad grave → cuarentena.
- `services/dashboard.py` con `alertas_accionables` (stock, RFID, sobrepoblación, revisiones, cuarentena).
- Frontend: severidad en `AnimalDetail.tsx`, alertas en `Dashboard.tsx`.

## P1-4: Gráficas de peso / sparklines

- [x] Instalar/confirmar Recharts en frontend (revisar si ya está en package.json)
- [x] Endpoint o reutilizar `/api/animales/{id}/eventos/` filtrado por tipo=pesaje para obtener serie histórica de peso
- [x] Componente Sparkline en la ficha del animal (línea simple, sin ejes, estilo minimalista)
- [x] Gráfica de tendencia de peso promedio por lote en el dashboard o en `/lotes/:id`
- [x] Manejar estado vacío: animal sin pesajes registrados (mostrar mensaje, no gráfica rota)
- [x] Probar con animales que tengan múltiples pesajes en el seed (agregar más pesajes históricos al seed_ganado.py si hace falta para que la demo se vea bien)

**Notas P1-4 (completado):**
- Recharts en `package.json`.
- Endpoint `GET /api/animales/{id}/pesajes/`.
- `WeightSparkline.tsx` en ficha; gráfica completa en `LoteDetail.tsx` con `peso_promedio_tendencia`.
- Seed: pesajes históricos para BOV-001.

## P1-5: Fotos de animales

- [x] Agregar campo `foto` (ImageField) al modelo Animal
- [x] Migración correspondiente
- [x] Configurar MEDIA_ROOT / MEDIA_URL en settings si no está configurado, servir media en desarrollo
- [x] Actualizar serializer de Animal para incluir URL de foto
- [x] Frontend: input de subida de foto en formulario de alta/edición (preview antes de guardar)
- [x] Mostrar thumbnail en listado de animales y foto grande en ficha de detalle
- [x] Placeholder genérico (silueta de vaca/icono) cuando no hay foto cargada
- [x] Agregar 3-5 fotos de ejemplo al seed_ganado.py para que la demo no se vea vacía (pueden ser URLs de imágenes libres de stock o placeholders locales)

**Notas P1-5 (completado):**
- `AnimalPhoto.tsx` placeholder; upload FormData en `AnimalForm.tsx`; thumbnails en `Animales.tsx`.
- Seed genera JPEG placeholder con Pillow para BOV-001 a BOV-005.

## Deuda técnica (hacer en paralelo o al final, no bloquea demo)

- [x] Agregar índices de base de datos en `Animal.rfid_tag` y `Animal.lote` (probablemente ya tienen index por ser FK/unique, verificar)
- [x] Escribir tests unitarios para los signals de: peso automático, estado por venta/muerte, stock de alimento, y los nuevos de traslado/cuarentena
- [x] Documentar en README qué signals existen y qué disparan (tabla similar a la de ARTEMIS_APP.md)

**Notas deuda técnica:**
- Índices en migración 0003 (`estado`, `lote+estado`); `rfid_tag` unique ya indexado.
- Tests en `backend/ganado/tests/test_signals.py`.
- Tabla de signals en `README.md`.

## KPIs nuevos para dashboard (hacer después de P0, antes o junto con P1)

- [x] Ganancia diaria de peso promedio (ADG) por lote — calcular desde eventos de pesaje consecutivos
- [x] Animales en cuarentena activa (count)
- [x] Vacunas/revisiones pendientes en próximos 7 días (requiere campo de próxima fecha programada — evaluar si agregar `proxima_revision` a Animal o crear modelo simple de recordatorios)
- [x] Días de stock de alimento restante (stock_actual / consumo_promedio_diario reciente)
- [x] Agregar estos KPIs al endpoint `/api/dashboard/` y a las cards del frontend

**Notas KPIs:**
- `services/dashboard.py` + merge en `DashboardViewSet`.
- Frontend: cards extendidas, ADG, días stock, alertas accionables en `Dashboard.tsx`.
