import axios from 'axios';
import { parse as cookieParse } from 'cookie';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((request) => {
  const { csrftoken } = cookieParse(document.cookie);
  if (request.headers && csrftoken) {
    request.headers['X-CSRFTOKEN'] = csrftoken;
  }
  return request;
});

export interface SessionInfo {
  authenticated: boolean;
  email?: string;
  id?: number;
}

export interface Animal {
  id: number;
  rfid_tag: string;
  numero_interno: string;
  especie: string;
  raza: string;
  sexo: string;
  fecha_nacimiento: string | null;
  peso_actual: string | null;
  lote: number | null;
  lote_nombre?: string;
  estado: string;
  estado_display?: string;
  fecha_registro: string;
  proxima_revision?: string | null;
  foto_url?: string | null;
  eventos?: EventoAnimal[];
  lecturas_rfid?: LecturaRFID[];
}

export interface EventoAnimal {
  id: number;
  animal: number;
  animal_numero_interno?: string;
  tipo: string;
  tipo_display: string;
  fecha: string;
  descripcion: string;
  valor_numerico: string | null;
  severidad?: string;
  severidad_display?: string;
  usuario_email?: string;
}

export interface LecturaRFID {
  id: number;
  animal: number | null;
  animal_numero?: string;
  rfid_tag_leido: string;
  fecha_hora: string;
  ubicacion_lectura?: string;
  procesado: boolean;
}

export interface MovimientoAlimento {
  id: number;
  alimento: number;
  tipo: string;
  cantidad: string;
  fecha: string;
  notas: string;
}

export interface Lote {
  id: number;
  nombre: string;
  capacidad: number;
  ubicacion: string;
  tipo_alimento_actual: number | null;
  tipo_alimento_actual_nombre?: string;
  animales_activos_count: number;
  capacidad_usada_pct: number;
  adg_kg_dia?: number | null;
  animales?: Animal[];
  peso_promedio_tendencia?: { fecha: string; peso_promedio: number }[];
}

export interface Alimento {
  id: number;
  nombre: string;
  tipo: string;
  stock_actual: string;
  stock_minimo: string;
  costo_unitario: string;
  fecha_ultima_entrada: string | null;
  stock_bajo: boolean;
}

export interface DashboardAlerta {
  tipo: string;
  severidad: 'alta' | 'media' | 'baja';
  titulo: string;
  descripcion: string;
  link: string;
  link_label: string;
}

export interface DashboardData {
  animales_activos: number;
  animales_sin_lectura: number;
  dias_sin_lectura: number;
  alertas_stock: Alimento[];
  ultimos_eventos: EventoAnimal[];
  ocupacion_lotes?: Lote[];
  ultimas_lecturas?: LecturaRFID[];
  animales_cuarentena?: number;
  revisiones_pendientes_count?: number;
  lotes_sobrepoblados_count?: number;
  alertas_accionables?: DashboardAlerta[];
  alertas_activas_count?: number;
  adg_por_lote?: { lote_id: number; lote_nombre: string; adg_kg_dia: number }[];
  stock_dias_restantes?: { alimento_id: number; nombre: string; dias_restantes: number; stock_bajo: boolean }[];
  revisiones_pendientes?: { animal_id: number; numero_interno: string; proxima_revision: string; lote_nombre: string | null }[];
  resumen_hato?: {
    total_registrados: number;
    peso_promedio_kg: number | null;
    ocupacion_global_pct: number;
    capacidad_total: number;
    ocupacion_total: number;
    lecturas_rfid_hoy: number;
    eventos_hoy: number;
  };
  actividad_semanal?: { fecha: string; label: string; eventos: number; lecturas_rfid: number }[];
  distribucion_estado?: { estado: string; label: string; total: number }[];
  eventos_por_tipo?: { tipo: string; label: string; total: number }[];
  peso_promedio_tendencia?: { fecha: string; peso_promedio: number }[];
}

export interface CambioEstadoResult {
  animal_id: number;
  numero_interno: string;
  estado_anterior: string;
  estado_nuevo: string;
  evento_id: number;
  animal?: Animal;
  transiciones_disponibles?: string[];
}

export interface TransicionesEstadoData {
  transiciones: Record<string, string[]>;
  conteos: Record<string, number>;
  estados: { value: string; label: string }[];
}

export interface CambioEstadoMasivoResult {
  exitosos: CambioEstadoResult[];
  errores: { animal_id: number; numero_interno: string; error: string }[];
  total_exitosos: number;
}

export interface PesajePoint {
  fecha: string;
  peso: number;
}

export interface TrazabilidadResponse {
  animal: Animal;
  timeline: {
    tipo_item: string;
    fecha: string;
    titulo: string;
    descripcion: string;
    icono: string;
    metadata: Record<string, unknown>;
  }[];
  total: number;
}

export interface RfidScanResult {
  lectura: { id: number; rfid_tag_leido: string; procesado: boolean };
  animal: Animal | null;
  registrado: boolean;
  mensaje: string;
  hubo_cambio_lote?: boolean;
  lote_anterior?: { id: number; nombre: string } | null;
  lote_nuevo?: { id: number; nombre: string } | null;
  tipo_movimiento?: 'traslado' | 'alta' | null;
}

export const authApi = {
  session: () => api.get<SessionInfo>('/auth/session/'),
  login: (email: string, password: string) => api.post('/auth/login/', { email, password }),
  logout: () => api.post('/auth/logout/'),
};

export const ganadoApi = {
  dashboard: () => api.get<DashboardData>('/dashboard/'),
  animales: (params?: Record<string, string>) => api.get<{ results: Animal[] }>('/animales/', { params }),
  animal: (id: number) => api.get<Animal>(`/animales/${id}/`),
  createAnimal: (data: Partial<Animal> | FormData) =>
    api.post<Animal>('/animales/', data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined),
  updateAnimal: (id: number, data: Partial<Animal> | FormData) =>
    api.patch<Animal>(`/animales/${id}/`, data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined),
  deleteAnimal: (id: number) => api.delete(`/animales/${id}/`),
  trazabilidad: (id: number) => api.get<TrazabilidadResponse>(`/animales/${id}/trazabilidad/`),
  pesajes: (id: number) => api.get<PesajePoint[]>(`/animales/${id}/pesajes/`),
  transicionesEstado: () => api.get<TransicionesEstadoData>('/animales/transiciones-estado/'),
  historialEstados: () => api.get<EventoAnimal[]>('/animales/historial-estados/'),
  cambiarEstado: (id: number, data: { estado: string; motivo: string; causa_enfermedad?: boolean; severidad?: string }) =>
    api.post<CambioEstadoResult>(`/animales/${id}/cambiar-estado/`, data),
  cambiarEstadoMasivo: (data: { animal_ids: number[]; estado: string; motivo: string; causa_enfermedad?: boolean; severidad?: string }) =>
    api.post<CambioEstadoMasivoResult>('/animales/cambiar-estado-masivo/', data),
  addEvento: (animalId: number, data: Partial<EventoAnimal>) =>
    api.post<EventoAnimal>(`/animales/${animalId}/eventos/`, data),
  lotes: () => api.get<{ results: Lote[] }>('/lotes/'),
  lote: (id: number) => api.get<Lote>(`/lotes/${id}/`),
  createLote: (data: Partial<Lote>) => api.post<Lote>('/lotes/', data),
  updateLote: (id: number, data: Partial<Lote>) => api.patch<Lote>(`/lotes/${id}/`, data),
  alimentos: () => api.get<{ results: Alimento[] }>('/alimentos/'),
  createAlimento: (data: Partial<Alimento>) => api.post<Alimento>('/alimentos/', data),
  movimientoAlimento: (id: number, data: { tipo: string; cantidad: string; fecha?: string; notas?: string }) =>
    api.post(`/alimentos/${id}/movimiento/`, data),
  movimientosAlimento: (id: number) => api.get<MovimientoAlimento[]>(`/alimentos/${id}/movimientos/`),
  rfidLecturas: () => api.get<{ results: LecturaRFID[] }>('/rfid/'),
  escanearRfid: (data: { rfid_tag: string; ubicacion_lote?: number; ubicacion_texto?: string }) =>
    api.post<RfidScanResult>('/rfid/escanear/', data),
};

export default api;
