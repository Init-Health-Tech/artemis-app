import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { ganadoApi, Lote } from '@/js/api/ganado';

const Lotes = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);

  useEffect(() => {
    ganadoApi.lotes().then((res) => setLotes(res.data.results ?? (res.data as unknown as Lote[])));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lotes / Potreros</h2>
        <Link
          className="rounded bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container hover:opacity-90"
          to="/lotes/nuevo"
        >
          + Nuevo lote
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lotes.map((l) => (
          <Link
            key={l.id}
            className="rounded-lg border border-outline-variant bg-surface-container p-5 hover:border-primary/50 transition"
            to={`/lotes/${l.id}`}
          >
            <h3 className="text-lg font-semibold text-primary">{l.nombre}</h3>
            <p className="mt-1 text-sm text-on-surface-variant">{l.ubicacion}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span>
                {l.animales_activos_count} / {l.capacidad} animales
              </span>
              <span className={`font-semibold ${l.capacidad_usada_pct > 90 ? 'text-error' : 'text-primary'}`}>
                {l.capacidad_usada_pct}%
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-surface-container-highest">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(l.capacidad_usada_pct, 100)}%` }}
              />
            </div>
            {l.tipo_alimento_actual_nombre && (
              <p className="mt-3 text-xs text-on-surface-variant">
                Alimento: {l.tipo_alimento_actual_nombre}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Lotes;
