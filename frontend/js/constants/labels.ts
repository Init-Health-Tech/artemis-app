export const EVENTO_TIPOS = [
  { value: 'vacunacion', label: 'Vacunación' },
  { value: 'enfermedad', label: 'Enfermedad' },
  { value: 'tratamiento', label: 'Tratamiento' },
  { value: 'parto', label: 'Parto' },
  { value: 'inseminacion', label: 'Inseminación' },
  { value: 'venta', label: 'Venta' },
  { value: 'traslado', label: 'Traslado' },
  { value: 'muerte', label: 'Muerte' },
  { value: 'revision', label: 'Revisión' },
  { value: 'pesaje', label: 'Pesaje' },
] as const;

export const ALIMENTO_TIPOS = [
  { value: 'forraje', label: 'Forraje' },
  { value: 'concentrado', label: 'Concentrado' },
  { value: 'suplemento', label: 'Suplemento' },
] as const;

export const ESTADOS_ANIMAL = [
  { value: 'activo', label: 'Activo' },
  { value: 'cuarentena', label: 'Cuarentena' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'muerto', label: 'Muerto' },
] as const;

export const ESTADO_CONFIG: Record<
  string,
  { label: string; icon: string; badge: string; description: string }
> = {
  activo: {
    label: 'Activo',
    icon: 'check_circle',
    badge: 'bg-primary/20 text-primary',
    description: 'En operación normal dentro del hato',
  },
  cuarentena: {
    label: 'Cuarentena',
    icon: 'coronavirus',
    badge: 'bg-tertiary/20 text-tertiary',
    description: 'Aislamiento sanitario — requiere seguimiento',
  },
  vendido: {
    label: 'Vendido',
    icon: 'sell',
    badge: 'bg-on-surface-variant/20 text-on-surface-variant',
    description: 'Salida del hato por venta',
  },
  muerto: {
    label: 'Muerto',
    icon: 'cancel',
    badge: 'bg-error-container text-error',
    description: 'Baja definitiva del inventario',
  },
};

export const labelFor = (list: readonly { value: string; label: string }[], value: string) =>
  list.find((i) => i.value === value)?.label ?? value;
