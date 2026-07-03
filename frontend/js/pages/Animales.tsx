import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { Animal, ganadoApi, Lote } from '@/js/api/ganado';
import AnimalPhoto from '@/js/components/AnimalPhoto';
import EmptyState from '@/js/components/EmptyState';
import { ESTADOS_ANIMAL } from '@/js/constants/labels';

const estadoBadge = (estado: string) => {
  const colors: Record<string, string> = {
    activo: 'bg-primary/20 text-primary',
    cuarentena: 'bg-tertiary/20 text-tertiary',
    vendido: 'bg-on-surface-variant/20 text-on-surface-variant',
    muerto: 'bg-error-container text-error',
  };
  return colors[estado] ?? 'bg-surface-container-high text-on-surface';
};

const Animales = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    lote: searchParams.get('lote') ?? '',
    estado: searchParams.get('estado') ?? '',
    especie: searchParams.get('especie') ?? '',
    search: searchParams.get('search') ?? '',
  });

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filtros.lote) params.lote = filtros.lote;
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.especie) params.especie = filtros.especie;
    if (filtros.search) params.search = filtros.search;
    ganadoApi
      .animales(params)
      .then((res) => setAnimales(res.data.results ?? (res.data as unknown as Animal[])))
      .finally(() => setLoading(false));
  }, [filtros]);

  useEffect(() => {
    ganadoApi.lotes().then((res) => setLotes(res.data.results ?? (res.data as unknown as Lote[])));
  }, []);

  useEffect(() => {
    load();
    const params: Record<string, string> = {};
    if (filtros.lote) params.lote = filtros.lote;
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.especie) params.especie = filtros.especie;
    if (filtros.search) params.search = filtros.search;
    setSearchParams(params);
  }, [filtros, load, setSearchParams]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Animales</h2>
        <Link
          className="rounded bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container hover:opacity-90"
          to="/animales/nuevo"
        >
          + Nuevo animal
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg border border-outline-variant bg-surface-container p-4">
        <input
          className="min-w-[180px] flex-1 rounded border border-outline-variant bg-surface-container-high px-3 py-1.5 text-sm"
          placeholder="Buscar por arete, RFID o raza..."
          value={filtros.search}
          onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
        />
        <select
          className="rounded border border-outline-variant bg-surface-container-high px-3 py-1.5 text-sm"
          value={filtros.lote}
          onChange={(e) => setFiltros({ ...filtros, lote: e.target.value })}
        >
          <option value="">Todos los lotes</option>
          {lotes.map((l) => (
            <option key={l.id} value={l.id}>{l.nombre}</option>
          ))}
        </select>
        <select
          className="rounded border border-outline-variant bg-surface-container-high px-3 py-1.5 text-sm"
          value={filtros.estado}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
        >
          <option value="">Todos los estados</option>
          {ESTADOS_ANIMAL.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
        <select
          className="rounded border border-outline-variant bg-surface-container-high px-3 py-1.5 text-sm"
          value={filtros.especie}
          onChange={(e) => setFiltros({ ...filtros, especie: e.target.value })}
        >
          <option value="">Todas las especies</option>
          <option value="bovino">Bovino</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      {loading ? (
        <p className="text-on-surface-variant">Cargando animales...</p>
      ) : animales.length === 0 ? (
        <EmptyState
          description="Ajusta los filtros o registra un animal nuevo"
          icon="pets"
          title="No se encontraron animales"
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-outline-variant">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container text-left text-xs uppercase text-on-surface-variant">
                <th className="px-4 py-2" />
                <th className="px-4 py-2">Nº Interno</th>
                <th className="px-4 py-2">RFID</th>
                <th className="px-4 py-2">Raza</th>
                <th className="px-4 py-2">Peso</th>
                <th className="px-4 py-2">Lote</th>
                <th className="px-4 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {animales.map((a) => (
                <tr key={a.id} className="border-b border-outline-variant/50 hover:bg-surface-container-high">
                  <td className="px-4 py-2.5">
                    <AnimalPhoto fotoUrl={a.foto_url} numeroInterno={a.numero_interno} size="sm" />
                  </td>
                  <td className="px-4 py-2.5">
                    <Link className="font-medium text-primary hover:underline" to={`/animales/${a.id}`}>
                      {a.numero_interno}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">{a.rfid_tag}</td>
                  <td className="px-4 py-2.5">{a.raza}</td>
                  <td className="px-4 py-2.5">{a.peso_actual ? `${a.peso_actual} kg` : '—'}</td>
                  <td className="px-4 py-2.5">{a.lote_nombre ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded px-2 py-0.5 text-xs ${estadoBadge(a.estado)}`}>
                      {a.estado_display ?? a.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Animales;
