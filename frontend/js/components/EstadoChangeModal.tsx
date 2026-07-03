import { FormEvent, useEffect, useMemo, useState } from 'react';

import { Animal } from '@/js/api/ganado';
import { ESTADO_CONFIG, ESTADOS_ANIMAL } from '@/js/constants/labels';

export interface EstadoChangeForm {
  estado: string;
  motivo: string;
  causa_enfermedad: boolean;
  severidad: string;
}

interface Props {
  open: boolean;
  animales: Animal[];
  transiciones: Record<string, string[]>;
  onClose: () => void;
  onSubmit: (form: EstadoChangeForm) => Promise<void>;
}

const EstadoChangeModal = ({ open, animales, transiciones, onClose, onSubmit }: Props) => {
  const [form, setForm] = useState<EstadoChangeForm>({
    estado: '',
    motivo: '',
    causa_enfermedad: false,
    severidad: 'moderada',
  });
  const [loading, setLoading] = useState(false);

  const destinosDisponibles = useMemo(() => {
    if (animales.length === 0) return [];
    const sets = animales.map((a) => new Set(transiciones[a.estado] ?? []));
    const interseccion = [...sets[0]].filter((e) => sets.every((s) => s.has(e)));
    return ESTADOS_ANIMAL.filter((e) => interseccion.includes(e.value));
  }, [animales, transiciones]);

  useEffect(() => {
    if (open) {
      setForm({
        estado: destinosDisponibles[0]?.value ?? '',
        motivo: '',
        causa_enfermedad: false,
        severidad: 'moderada',
      });
    }
  }, [open, destinosDisponibles]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        className="w-full max-w-lg rounded-2xl border border-outline-variant bg-surface-container p-6 shadow-xl"
        onSubmit={handleSubmit}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Cambiar estado</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              {animales.length === 1
                ? `${animales[0].numero_interno} — ${animales[0].estado_display ?? animales[0].estado}`
                : `${animales.length} animales seleccionados`}
            </p>
          </div>
          <button
            className="text-on-surface-variant hover:text-on-surface"
            type="button"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {destinosDisponibles.length === 0 ? (
          <p className="text-sm text-error">
            Los animales seleccionados no comparten transiciones de estado válidas.
          </p>
        ) : (
          <>
            <label className="mb-4 block">
              <span className="mb-2 block text-sm text-on-surface-variant">Nuevo estado</span>
              <div className="grid grid-cols-2 gap-2">
                {destinosDisponibles.map((e) => {
                  const cfg = ESTADO_CONFIG[e.value];
                  const selected = form.estado === e.value;
                  return (
                    <button
                      key={e.value}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition ${
                        selected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-outline-variant hover:border-primary/30'
                      }`}
                      type="button"
                      onClick={() => setForm({ ...form, estado: e.value })}
                    >
                      <span className="material-symbols-outlined text-[20px]">{cfg?.icon}</span>
                      <span className="font-medium">{e.label}</span>
                    </button>
                  );
                })}
              </div>
            </label>

            <label className="mb-4 block">
              <span className="mb-1 block text-sm text-on-surface-variant">Motivo *</span>
              <textarea
                required
                className="w-full rounded-xl border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
                placeholder="Ej. Fiebre detectada en revisión matutina"
                rows={3}
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              />
            </label>

            {form.estado === 'cuarentena' && (
              <div className="mb-4 space-y-3 rounded-xl border border-tertiary/20 bg-tertiary/5 p-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={form.causa_enfermedad}
                    type="checkbox"
                    onChange={(e) => setForm({ ...form, causa_enfermedad: e.target.checked })}
                  />
                  Registrar como evento de enfermedad
                </label>
                {form.causa_enfermedad && (
                  <select
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
                    value={form.severidad}
                    onChange={(e) => setForm({ ...form, severidad: e.target.value })}
                  >
                    <option value="leve">Leve</option>
                    <option value="moderada">Moderada</option>
                    <option value="grave">Grave</option>
                  </select>
                )}
              </div>
            )}

            {form.estado && ESTADO_CONFIG[form.estado] && (
              <p className="mb-4 text-xs text-on-surface-variant">
                {ESTADO_CONFIG[form.estado].description}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                className="rounded-xl border border-outline-variant px-4 py-2 text-sm"
                type="button"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                className="rounded-xl bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container disabled:opacity-50"
                disabled={loading || !form.estado}
                type="submit"
              >
                {loading ? 'Guardando...' : 'Confirmar cambio'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default EstadoChangeModal;
