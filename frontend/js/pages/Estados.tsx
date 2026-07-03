import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { Animal, EventoAnimal, ganadoApi, TransicionesEstadoData } from '@/js/api/ganado';
import AnimalPhoto from '@/js/components/AnimalPhoto';
import EstadoChangeModal, { EstadoChangeForm } from '@/js/components/EstadoChangeModal';
import { useToast } from '@/js/components/Toast';
import { ESTADO_CONFIG, ESTADOS_ANIMAL } from '@/js/constants/labels';

const Estados = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [meta, setMeta] = useState<TransicionesEstadoData | null>(null);
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [historial, setHistorial] = useState<EventoAnimal[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTargets, setModalTargets] = useState<Animal[]>([]);
  const [filtroEstado, setFiltroEstado] = useState(searchParams.get('estado') ?? '');
  const [search, setSearch] = useState(searchParams.get('animal') ?? '');
  const openedAnimalRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    const params: Record<string, string> = {};
    if (filtroEstado) params.estado = filtroEstado;
    if (search) params.search = search;
    const animalId = searchParams.get('animal_id');

    const [metaRes, historialRes] = await Promise.all([
      ganadoApi.transicionesEstado(),
      ganadoApi.historialEstados(),
    ]);
    setMeta(metaRes.data);
    setHistorial(historialRes.data);

    if (animalId) {
      const animalRes = await ganadoApi.animal(Number(animalId));
      setAnimales([animalRes.data]);
    } else {
      const animalesRes = await ganadoApi.animales(params);
      setAnimales(animalesRes.data.results ?? []);
    }
  }, [filtroEstado, search, searchParams]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filtroEstado) params.estado = filtroEstado;
    if (search) params.search = search;
    const animalId = searchParams.get('animal_id');
    if (animalId) params.animal_id = animalId;
    setSearchParams(params);
  }, [filtroEstado, search, searchParams, setSearchParams]);

  useEffect(() => {
    const animalId = searchParams.get('animal_id');
    if (!animalId || !meta || openedAnimalRef.current === animalId) return;
    const animal = animales.find((a) => String(a.id) === animalId);
    if (animal && (meta.transiciones[animal.estado] ?? []).length > 0) {
      openedAnimalRef.current = animalId;
      setModalTargets([animal]);
      setModalOpen(true);
    }
  }, [searchParams, animales, meta]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openModal = (targets: Animal[]) => {
    setModalTargets(targets);
    setModalOpen(true);
  };

  const handleCambio = async (form: EstadoChangeForm) => {
    const payload = {
      estado: form.estado,
      motivo: form.motivo,
      causa_enfermedad: form.causa_enfermedad,
      severidad: form.severidad,
    };

    if (modalTargets.length === 1) {
      await ganadoApi.cambiarEstado(modalTargets[0].id, payload);
      toast(`Estado actualizado: ${modalTargets[0].numero_interno}`);
    } else {
      const res = await ganadoApi.cambiarEstadoMasivo({
        animal_ids: modalTargets.map((a) => a.id),
        ...payload,
      });
      toast(`${res.data.total_exitosos} animales actualizados`);
      if (res.data.errores.length > 0) {
        toast(`${res.data.errores.length} no pudieron cambiarse`, 'error');
      }
    }
    setSelected(new Set());
    load();
  };

  const selectedAnimales = animales.filter((a) => selected.has(a.id));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Operaciones</p>
          <h1 className="mt-1 text-2xl font-bold">Gestión de estados</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Cuarentena, altas sanitarias, ventas y bajas con trazabilidad
          </p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ESTADOS_ANIMAL.map((e) => {
          const cfg = ESTADO_CONFIG[e.value];
          const count = meta?.conteos?.[e.value] ?? 0;
          const active = filtroEstado === e.value;
          return (
            <button
              key={e.value}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? 'border-primary bg-primary/10'
                  : 'border-outline-variant/60 bg-surface-container hover:border-primary/30'
              }`}
              type="button"
              onClick={() => setFiltroEstado(active ? '' : e.value)}
            >
              <div className="flex items-center justify-between">
                <span className={`material-symbols-outlined ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {cfg.icon}
                </span>
                <span className="text-2xl font-bold">{count}</span>
              </div>
              <p className="mt-2 font-medium">{e.label}</p>
              <p className="text-xs text-on-surface-variant">{cfg.description}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container p-4">
        <input
          className="min-w-[200px] flex-1 rounded-xl border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
          placeholder="Buscar por arete, RFID o raza..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {selected.size > 0 && (
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container"
            type="button"
            onClick={() => openModal(selectedAnimales)}
          >
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
            Cambiar estado ({selected.size})
          </button>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container xl:col-span-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-high text-left text-xs uppercase text-on-surface-variant">
                <th className="px-4 py-3 w-10" />
                <th className="px-4 py-3" />
                <th className="px-4 py-3">Animal</th>
                <th className="px-4 py-3">Lote</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {animales.map((a) => {
                const cfg = ESTADO_CONFIG[a.estado];
                const puedeCambiar = (meta?.transiciones[a.estado] ?? []).length > 0;
                return (
                  <tr key={a.id} className="border-b border-outline-variant/40 hover:bg-surface-container-high">
                    <td className="px-4 py-3">
                      <input
                        checked={selected.has(a.id)}
                        disabled={!puedeCambiar}
                        type="checkbox"
                        onChange={() => toggleSelect(a.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <AnimalPhoto fotoUrl={a.foto_url} numeroInterno={a.numero_interno} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <Link className="font-medium text-primary hover:underline" to={`/animales/${a.id}`}>
                        {a.numero_interno}
                      </Link>
                      <p className="font-mono text-xs text-on-surface-variant">{a.rfid_tag}</p>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{a.lote_nombre ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cfg?.badge}`}>
                        <span className="material-symbols-outlined text-[14px]">{cfg?.icon}</span>
                        {a.estado_display ?? a.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {puedeCambiar ? (
                        <button
                          className="rounded-lg border border-outline-variant px-3 py-1 text-xs hover:border-primary/40 hover:text-primary"
                          type="button"
                          onClick={() => openModal([a])}
                        >
                          Cambiar
                        </button>
                      ) : (
                        <span className="text-xs text-on-surface-variant">Final</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="rounded-2xl border border-outline-variant/60 bg-surface-container p-5">
          <h2 className="mb-4 text-sm font-semibold">Historial de cambios</h2>
          <div className="max-h-[32rem] space-y-3 overflow-y-auto">
            {historial.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Sin cambios registrados aún.</p>
            ) : (
              historial.map((e) => (
                <div key={e.id} className="rounded-xl border border-outline-variant/40 bg-surface-container-high p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link className="text-sm font-medium text-primary hover:underline" to={`/animales/${e.animal}`}>
                      {e.animal_numero_interno}
                    </Link>
                    <time className="text-[10px] text-on-surface-variant">
                      {new Date(e.fecha).toLocaleString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant">{e.descripcion.replace('[Cambio estado] ', '')}</p>
                  <p className="mt-1 text-[10px] text-on-surface-variant">{e.usuario_email}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <EstadoChangeModal
        animales={modalTargets}
        open={modalOpen}
        transiciones={meta?.transiciones ?? {}}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCambio}
      />
    </div>
  );
};

export default Estados;
