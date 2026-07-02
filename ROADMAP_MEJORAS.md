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
- Prueba manual OK: RFID-1001 traslado Corral Maternidad → Lote Engorda; RFID-SIN-LOTE alta en lote.

## P0-2: Trazabilidad visual completa

- [ ] Revisar diseño de referencia en `stitch_agrotrace_enterprise_saas/full_traceability_view/`
- [ ] Crear endpoint `/api/animales/{id}/trazabilidad/` que devuelva eventos + lecturas RFID + cambios de lote ordenados cronológicamente en un solo payload unificado
- [ ] Crear página `/animales/:id/trazabilidad` (o sección dentro de la ficha existente) con componente de timeline visual (usar iconos distintos por tipo de evento)
- [ ] Incluir en el timeline: alta, vacunaciones, tratamientos, pesajes, traslados, lecturas RFID relevantes, venta/muerte si aplica
- [ ] Agregar botón "Ver trazabilidad completa" desde la ficha del animal
- [ ] Probar con animal que tenga historial variado (usar BOV-001 del seed)

## P0-3: Cuarentena automática y alertas accionables

- [ ] Definir en signals: si se crea `EventoAnimal` tipo `enfermedad` con severidad alta (agregar campo `severidad` a EventoAnimal si no existe: leve/moderada/grave), cambiar `animal.estado` → `cuarentena`
- [ ] Migración para el nuevo campo `severidad` en EventoAnimal (default: moderada, para no romper datos existentes)
- [ ] Actualizar formulario de registro rápido de eventos en frontend para incluir selector de severidad cuando el tipo es "enfermedad"
- [ ] Dashboard: sección de alertas accionables (no solo números) — cada alerta debe tener link directo a la ficha del animal o lote correspondiente
- [ ] Agregar alerta de "sobrepoblación de lote" (capacidad_usada_pct > 100%) si no existe ya
- [ ] Probar: crear evento de enfermedad grave, verificar que el animal pasa a cuarentena y aparece en alertas del dashboard

## P1-4: Gráficas de peso / sparklines

- [ ] Instalar/confirmar Recharts en frontend (revisar si ya está en package.json)
- [ ] Endpoint o reutilizar `/api/animales/{id}/eventos/` filtrado por tipo=pesaje para obtener serie histórica de peso
- [ ] Componente Sparkline en la ficha del animal (línea simple, sin ejes, estilo minimalista)
- [ ] Gráfica de tendencia de peso promedio por lote en el dashboard o en `/lotes/:id`
- [ ] Manejar estado vacío: animal sin pesajes registrados (mostrar mensaje, no gráfica rota)
- [ ] Probar con animales que tengan múltiples pesajes en el seed (agregar más pesajes históricos al seed_ganado.py si hace falta para que la demo se vea bien)

## P1-5: Fotos de animales

- [ ] Agregar campo `foto` (ImageField) al modelo Animal
- [ ] Migración correspondiente
- [ ] Configurar MEDIA_ROOT / MEDIA_URL en settings si no está configurado, servir media en desarrollo
- [ ] Actualizar serializer de Animal para incluir URL de foto
- [ ] Frontend: input de subida de foto en formulario de alta/edición (preview antes de guardar)
- [ ] Mostrar thumbnail en listado de animales y foto grande en ficha de detalle
- [ ] Placeholder genérico (silueta de vaca/icono) cuando no hay foto cargada
- [ ] Agregar 3-5 fotos de ejemplo al seed_ganado.py para que la demo no se vea vacía (pueden ser URLs de imágenes libres de stock o placeholders locales)

## Deuda técnica (hacer en paralelo o al final, no bloquea demo)

- [ ] Agregar índices de base de datos en `Animal.rfid_tag` y `Animal.lote` (probablemente ya tienen index por ser FK/unique, verificar)
- [ ] Escribir tests unitarios para los signals de: peso automático, estado por venta/muerte, stock de alimento, y los nuevos de traslado/cuarentena
- [ ] Documentar en README qué signals existen y qué disparan (tabla similar a la de ARTEMIS_APP.md)

## KPIs nuevos para dashboard (hacer después de P0, antes o junto con P1)

- [ ] Ganancia diaria de peso promedio (ADG) por lote — calcular desde eventos de pesaje consecutivos
- [ ] Animales en cuarentena activa (count)
- [ ] Vacunas/revisiones pendientes en próximos 7 días (requiere campo de próxima fecha programada — evaluar si agregar `proxima_revision` a Animal o crear modelo simple de recordatorios)
- [ ] Días de stock de alimento restante (stock_actual / consumo_promedio_diario reciente)
- [ ] Agregar estos KPIs al endpoint `/api/dashboard/` y a las cards del frontend
