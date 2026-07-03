import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { ganadoApi, Lote } from '@/js/api/ganado';

const LoteDetail = () => {
  const { id } = useParams();
  const [lote, setLote] = useState<Lote | null>(null);

  useEffect(() => {
    if (id) ganadoApi.lote(Number(id)).then((res) => setLote(res.data));
  }, [id]);

  if (!lote) return <p>Cargando...</p>;

  const tendencia = lote.peso_promedio_tendencia ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link className="text-sm text-on-surface-variant hover:text-primary" to="/lotes">← Lotes</Link>
          <h2 className="mt-1 text-2xl font-semibold">{lote.nombre}</h2>
          <p className="text-on-surface-variant">{lote.ubicacion}</p>
        </div>
        <Link
          className="rounded border border-outline-variant px-3 py-1.5 text-sm hover:bg-surface-container-high"
          to={`/lotes/${id}/editar`}
        >
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-outline-variant bg-surface-container p-4">
          <p className="text-xs uppercase text-on-surface-variant">Capacidad</p>
          <p className="text-2xl font-bold text-primary">{lote.capacidad}</p>
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface-container p-4">
          <p className="text-xs uppercase text-on-surface-variant">Ocupación</p>
          <p className="text-2xl font-bold">{lote.animales_activos_count}</p>
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface-container p-4">
          <p className="text-xs uppercase text-on-surface-variant">Uso</p>
          <p className={`text-2xl font-bold ${lote.capacidad_usada_pct > 100 ? 'text-error' : ''}`}>
            {lote.capacidad_usada_pct}%
          </p>
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface-container p-4">
          <p className="text-xs uppercase text-on-surface-variant">ADG promedio</p>
          <p className="text-2xl font-bold">
            {lote.adg_kg_dia != null ? `${lote.adg_kg_dia} kg/día` : '—'}
          </p>
        </div>
      </div>

      {tendencia.length >= 2 && (
        <section className="rounded-lg border border-outline-variant bg-surface-container p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
            Peso promedio del lote
          </h3>
          <div className="h-56">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={tendencia}>
                <CartesianGrid stroke="#3a4a3c" strokeDasharray="3 3" />
                <XAxis dataKey="fecha" stroke="#9ca89e" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca89e" tick={{ fontSize: 11 }} unit=" kg" />
                <Tooltip
                  contentStyle={{ background: '#1a241c', border: '1px solid #3a4a3c' }}
                  formatter={(value: number) => [`${value} kg`, 'Promedio']}
                />
                <Line dataKey="peso_promedio" dot stroke="#93d695" strokeWidth={2} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-outline-variant">
        <h3 className="border-b border-outline-variant px-5 py-3 text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
          Animales en el lote
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant text-left text-xs uppercase text-on-surface-variant">
              <th className="px-5 py-2">Nº Interno</th>
              <th className="px-5 py-2">RFID</th>
              <th className="px-5 py-2">Raza</th>
              <th className="px-5 py-2">Peso</th>
            </tr>
          </thead>
          <tbody>
            {(lote.animales ?? []).map((a) => (
              <tr key={a.id} className="border-b border-outline-variant/50 hover:bg-surface-container-high">
                <td className="px-5 py-2.5">
                  <Link className="text-primary hover:underline" to={`/animales/${a.id}`}>
                    {a.numero_interno}
                  </Link>
                </td>
                <td className="px-5 py-2.5 font-mono text-xs">{a.rfid_tag}</td>
                <td className="px-5 py-2.5">{a.raza}</td>
                <td className="px-5 py-2.5">{a.peso_actual ? `${a.peso_actual} kg` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default LoteDetail;
