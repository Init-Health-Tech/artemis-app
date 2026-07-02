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
  animales?: Animal[];
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

export interface DashboardData {
  animales_activos: number;
  animales_sin_lectura: number;
  dias_sin_lectura: number;
  alertas_stock: Alimento[];
  ultimos_eventos: EventoAnimal[];
  ocupacion_lotes?: Lote[];
  ultimas_lecturas?: LecturaRFID[];
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
  createAnimal: (data: Partial<Animal>) => api.post<Animal>('/animales/', data),
  updateAnimal: (id: number, data: Partial<Animal>) => api.patch<Animal>(`/animales/${id}/`, data),
  deleteAnimal: (id: number) => api.delete(`/animales/${id}/`),
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
