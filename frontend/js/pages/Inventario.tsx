import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router';

import { Alimento, ganadoApi, MovimientoAlimento } from '@/js/api/ganado';
import EmptyState from '@/js/components/EmptyState';
import { useToast } from '@/js/components/Toast';
import { ALIMENTO_TIPOS, labelFor } from '@/js/constants/labels';

const Inventario = () => {
  const { toast } = useToast();
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoAlimento[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [movimiento, setMovimiento] = useState({ tipo: 'entrada', cantidad: '', notas: '' });
  const [nuevo, setNuevo] = useState({
    nombre: '',
    tipo: 'forraje',
    stock_actual: '0',
    stock_minimo: '0',
    costo_unitario: '0',
  });

  const load = () => {
    ganadoApi.alimentos().then((res) => setAlimentos(res.data.results ?? (res.data as unknown as Alimento[])));
  };

  useEffect(() => { load(); }, []);

  const selectAlimento = async (id: number) => {
    setSelected(id);
    const res = await ganadoApi.movimientosAlimento(id);
    setMovimientos(res.data);
  };

  const handleMovimiento = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      await ganadoApi.movimientoAlimento(selected, movimiento);
      toast('Movimiento registrado');
      setMovimiento({ tipo: 'entrada', cantidad: '', notas: '' });
      load();
      selectAlimento(selected);
    } catch {
      toast('Error al registrar movimiento', 'error');
    }
  };

  const handleNuevo = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await ganadoApi.createAlimento(nuevo);
      toast('Alimento creado');
      setShowNew(false);
      setNuevo({ nombre: '', tipo: 'forraje', stock_actual: '0', stock_minimo: '0', costo_unitario: '0' });
      load();
    } catch {
      toast('Error al crear alimento', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Inventario de Alimentos</h2>
        <button
          className="rounded bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container"
          type="button"
          onClick={() => setShowNew(!showNew)}
        >
          {showNew ? 'Cancelar' : '+ Nuevo alimento'}
        </button>
      </div>

      {showNew && (
        <form className="rounded-lg border border-outline-variant bg-surface-container p-5" onSubmit={handleNuevo}>
          <h3 className="mb-3 text-sm font-semibold uppercase text-on-surface-variant">Nuevo alimento</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              className="rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
              placeholder="Nombre"
              required
              value={nuevo.nombre}
              onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            />
            <select
              className="rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
              value={nuevo.tipo}
              onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })}
            >
              {ALIMENTO_TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input
              className="rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
              placeholder="Stock inicial (kg)"
              type="number"
              value={nuevo.stock_actual}
              onChange={(e) => setNuevo({ ...nuevo, stock_actual: e.target.value })}
            />
            <input
              className="rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
              placeholder="Stock mínimo (kg)"
              type="number"
              value={nuevo.stock_minimo}
              onChange={(e) => setNuevo({ ...nuevo, stock_minimo: e.target.value })}
            />
            <input
              className="rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
              placeholder="Costo unitario"
              type="number"
              value={nuevo.costo_unitario}
              onChange={(e) => setNuevo({ ...nuevo, costo_unitario: e.target.value })}
            />
            <button className="rounded bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container" type="submit">
              Guardar
            </button>
          </div>
        </form>
      )}

      {alimentos.length === 0 ? (
        <EmptyState icon="inventory_2" title="Sin alimentos en inventario" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-outline-variant">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container text-left text-xs uppercase text-on-surface-variant">
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Stock</th>
                <th className="px-4 py-2">Mínimo</th>
                <th className="px-4 py-2">Costo/u</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {alimentos.map((a) => (
                <tr key={a.id} className="border-b border-outline-variant/50 hover:bg-surface-container-high">
                  <td className="px-4 py-2.5 font-medium">{a.nombre}</td>
                  <td className="px-4 py-2.5">{labelFor(ALIMENTO_TIPOS, a.tipo)}</td>
                  <td className="px-4 py-2.5">{a.stock_actual} kg</td>
                  <td className="px-4 py-2.5">{a.stock_minimo} kg</td>
                  <td className="px-4 py-2.5">${a.costo_unitario}</td>
                  <td className="px-4 py-2.5">
                    {a.stock_bajo ? (
                      <span className="rounded bg-error-container px-2 py-0.5 text-xs text-error">Bajo</span>
                    ) : (
                      <span className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">OK</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <button className="text-xs text-primary hover:underline" type="button" onClick={() => selectAlimento(a.id)}>
                      Movimiento
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="space-y-4">
          <form className="rounded-lg border border-outline-variant bg-surface-container p-5" onSubmit={handleMovimiento}>
            <h3 className="mb-3 text-sm font-semibold uppercase text-on-surface-variant">
              Registrar movimiento — {alimentos.find((a) => a.id === selected)?.nombre}
            </h3>
            <div className="flex flex-wrap gap-3">
              <select
                className="rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
                value={movimiento.tipo}
                onChange={(e) => setMovimiento({ ...movimiento, tipo: e.target.value })}
              >
                <option value="entrada">Entrada</option>
                <option value="consumo">Consumo</option>
              </select>
              <input
                className="w-32 rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
                placeholder="Cantidad kg"
                required
                type="number"
                value={movimiento.cantidad}
                onChange={(e) => setMovimiento({ ...movimiento, cantidad: e.target.value })}
              />
              <input
                className="flex-1 rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
                placeholder="Notas"
                value={movimiento.notas}
                onChange={(e) => setMovimiento({ ...movimiento, notas: e.target.value })}
              />
              <button className="rounded bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container" type="submit">
                Registrar
              </button>
              <button className="rounded border border-outline-variant px-4 py-2 text-sm" type="button" onClick={() => setSelected(null)}>
                Cerrar
              </button>
            </div>
          </form>

          {movimientos.length > 0 && (
            <section className="rounded-lg border border-outline-variant">
              <h4 className="border-b border-outline-variant px-5 py-2 text-xs font-semibold uppercase text-on-surface-variant">
                Últimos movimientos
              </h4>
              <table className="w-full text-sm">
                <tbody>
                  {movimientos.map((m) => (
                    <tr key={m.id} className="border-b border-outline-variant/50">
                      <td className="px-5 py-2 capitalize">{m.tipo}</td>
                      <td className="px-5 py-2">{m.cantidad} kg</td>
                      <td className="px-5 py-2 text-on-surface-variant">{m.notas || '—'}</td>
                      <td className="px-5 py-2 text-xs">{m.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Inventario;
