# ArtemisApp — Checklist Demo Cliente

> Roadmap para llevar el MVP a una demo presentable. Marca `[x]` al completar.

**Credenciales demo:** `admin@artemis.local` / `admin123`  
**Reset datos:** `docker compose run --rm backend python manage.py seed_ganado --force`

---

## Fase 1 — Demo funcional end-to-end (prioridad alta)

### Datos y narrativa
- [x] Seed con descripciones realistas en español (vacunas, tratamientos, partos)
- [x] Seed con `--force` para resetear demo
- [x] Variedad de eventos: traslado, venta, parto, inseminación, enfermedad
- [x] Animales en distintos estados (activo, cuarentena, vendido, muerto)
- [x] Lecturas RFID recientes en distintos potreros
- [ ] 25+ animales para que el dashboard se vea poblado
- [ ] Operador demo adicional (veterinario@artemis.local)

### Flujo RFID (ancla de la demo — ~5 min)
- [x] Simulador con feedback visual (éxito / tag desconocido)
- [x] Historial de lecturas recientes en pantalla RFID
- [x] Link directo a registrar animal con tag prellenado
- [x] Lecturas RFID visibles en ficha del animal
- [ ] Sonido/vibración simulada al escanear (opcional)
- [ ] QR con tags de prueba para escanear desde móvil

### Animales
- [x] CRUD completo
- [x] Filtros: lote, estado, especie, búsqueda
- [x] Filtros reactivos (sin botón "Filtrar")
- [x] Etiquetas en español (estados, sexo, tipos de evento)
- [x] Timeline unificada: eventos + lecturas RFID en ficha
- [x] Evento venta/muerte actualiza estado del animal automáticamente
- [x] Pesaje actualiza peso y muestra confirmación
- [x] Estados vacíos cuando no hay resultados
- [ ] Exportar listado CSV
- [ ] Foto del animal (placeholder)

### Lotes / Potreros
- [x] Vista tarjetas con barra de ocupación
- [x] Detalle con animales del lote
- [x] Formulario crear/editar lote
- [ ] Asignar animal a lote desde ficha (evento traslado + cambio de lote)
- [ ] Mapa visual del rancho (futuro)

### Inventario
- [x] Alertas stock bajo (badge rojo/amarillo)
- [x] Registrar entrada/consumo
- [x] Formulario crear alimento
- [x] Historial de movimientos por alimento
- [ ] Costo total inventario en dashboard

### Dashboard ejecutivo
- [x] KPIs: activos, sin lectura RFID, alertas stock
- [x] KPIs clicables (navegan al módulo filtrado)
- [x] Ocupación por lote (barras)
- [x] Últimos eventos con número interno (BOV-003)
- [x] Últimas lecturas RFID
- [ ] Gráfica de peso promedio del hato
- [ ] Sparklines de tendencia (diseño Stitch)

---

## Fase 2 — Pulido UX para presentación

### Feedback y errores
- [x] Toasts de éxito/error en acciones
- [x] Mensajes de validación en formularios
- [x] Loading states en tablas y formularios
- [ ] Confirmación modal estilizada (reemplazar `confirm()` nativo)

### UI / Marca
- [x] Banner "Modo Demo" con guía rápida
- [x] Copy en español mexicano
- [x] Paleta Stitch / INIT Core aplicada
- [ ] Breadcrumbs por página
- [ ] Logo ArtemisApp en login y sidebar
- [ ] Responsive básico (tablet)

### Auth
- [x] Login funcional con CSRF
- [x] Protección de rutas
- [ ] Pantalla de bienvenida post-login con tour de 3 pasos

---

## Fase 3 — Módulos avanzados (post-demo)

### Trazabilidad
- [ ] Vista timeline completa (diseño `full_traceability_view/`)
- [ ] Cadena: origen → lote → eventos → lecturas → venta

### Analytics
- [ ] Predicciones mock (diseño `analytics_predictions/`)
- [ ] Gráficas de engorda y conversión alimenticia

### Operaciones
- [ ] Multi-usuario con roles (vaquero, veterinario, admin)
- [ ] Notificaciones push de alertas
- [ ] Integración lector RFID físico (USB/Bluetooth)
- [ ] App móvil offline-first

### Infra
- [ ] Deploy staging (Render/Railway)
- [ ] CI con tests de smoke
- [ ] Backup automático PostgreSQL

---

## Guía rápida para presentar al cliente (15 min)

| Paso | Acción | Qué mostrar |
|------|--------|-------------|
| 1 | Login → Dashboard | KPIs, alerta Melaza bajo mínimo, ocupación de potreros |
| 2 | RFID → escanear `RFID-1001` | Identificación instantánea de BOV-001 |
| 3 | RFID → escanear `RFID-DEMO-NEW` | Flujo de registro de animal nuevo |
| 4 | Animales → BOV-003 | Historial, registrar pesaje, ver peso actualizado |
| 5 | Lotes → Potrero Norte | Capacidad usada, listado de animales |
| 6 | Inventario → Melaza | Alerta roja, registrar entrada de stock |
| 7 | Admin Django | Carga masiva vía import/export (opcional) |

---

## Comandos útiles

```bash
# Levantar
docker compose up -d

# Reset demo
docker compose run --rm backend python manage.py seed_ganado --force

# Ver logs
docker compose logs -f backend frontend
```

---

*Última actualización: implementación Fase 1 + parte Fase 2*
