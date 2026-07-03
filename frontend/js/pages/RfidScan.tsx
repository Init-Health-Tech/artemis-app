import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router';

import { ganadoApi, LecturaRFID, Lote, RfidScanResult } from '@/js/api/ganado';
import DemoBanner from '@/js/components/DemoBanner';
import { useToast } from '@/js/components/Toast';

const RfidScan = () => {
  const { toast } = useToast();
  const [tag, setTag] = useState('');
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [ubicacionLote, setUbicacionLote] = useState('');
  const [ubicacionTexto, setUbicacionTexto] = useState('Báscula de entrada');
  const [result, setResult] = useState<RfidScanResult | null>(null);
  const [historial, setHistorial] = useState<LecturaRFID[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistorial = () => {
    ganadoApi.rfidLecturas().then((res) => {
      const list = res.data.results ?? (res.data as unknown as LecturaRFID[]);
      setHistorial(list.slice(0, 10));
    });
  };

  useEffect(() => {
    ganadoApi.lotes().then((res) => setLotes(res.data.results ?? (res.data as unknown as Lote[])));
    loadHistorial();
  }, []);

  const handleScan = async (e: FormEvent) => {
    e.preventDefault();
    if (!tag.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await ganadoApi.escanearRfid({
        rfid_tag: tag.trim(),
        ubicacion_lote: ubicacionLote ? Number(ubicacionLote) : undefined,
        ubicacion_texto: ubicacionTexto,
      });
      setResult(res.data);
      if (res.data.hubo_cambio_lote && res.data.lote_nuevo) {
        if (res.data.tipo_movimiento === 'traslado' && res.data.lote_anterior) {
          toast(
            `Trasladado: ${res.data.lote_anterior.nombre} → ${res.data.lote_nuevo.nombre}`,
            'success',
          );
        } else {
          toast(`Asignado al lote ${res.data.lote_nuevo.nombre}`, 'success');
        }
      } else {
        toast(res.data.registrado ? 'Animal identificado' : 'Tag no registrado', res.data.registrado ? 'success' : 'info');
      }
      loadHistorial();
    } catch {
      toast('Error al escanear', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DemoBanner />

      <div className="mx-auto max-w-2xl text-center">
        <span className="material-symbols-outlined text-6xl text-primary">nfc</span>
        <h2 className="mt-2 text-2xl font-semibold">Simulador RFID de Campo</h2>
        <p className="text-sm text-on-surface-variant">
          Prueba con <strong className="text-primary">RFID-1001</strong> (registrado) en un{' '}
          <strong className="text-primary">potrero distinto</strong> al actual para ver el traslado automático, o{' '}
          <strong className="text-primary">RFID-DEMO-NEW</strong> (nuevo)
        </p>
      </div>

      <form
        className="mx-auto max-w-2xl space-y-4 rounded-lg border border-outline-variant bg-surface-container p-4 sm:p-6"
        onSubmit={handleScan}
      >
        <label className="block">
          <span className="mb-1 block text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
            Tag RFID
          </span>
          <input
            autoFocus
            className="w-full rounded border-2 border-primary/50 bg-surface-container-high px-4 py-3 font-mono text-lg focus:border-primary focus:outline-none"
            placeholder="RFID-1001"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-on-surface-variant">Potrero</span>
            <select
              className="w-full rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
              value={ubicacionLote}
              onChange={(e) => setUbicacionLote(e.target.value)}
            >
              <option value="">—</option>
              {lotes.map((l) => (
                <option key={l.id} value={l.id}>{l.nombre}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-on-surface-variant">Ubicación</span>
            <input
              className="w-full rounded border border-outline-variant bg-surface-container-high px-3 py-2 text-sm"
              value={ubicacionTexto}
              onChange={(e) => setUbicacionTexto(e.target.value)}
            />
          </label>
        </div>
        <button
          className="w-full rounded bg-primary-container py-3 font-semibold text-on-primary-container hover:opacity-90 disabled:opacity-50"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Escaneando...' : 'Escanear tag'}
        </button>
      </form>

      {result && (
        <div
          className={`mx-auto max-w-2xl rounded-lg border p-6 ${
            result.registrado ? 'border-primary/50 bg-primary/10' : 'border-tertiary/50 bg-tertiary/10'
          }`}
        >
          <p className="font-semibold">{result.mensaje}</p>
          {result.hubo_cambio_lote && result.lote_nuevo && (
            <div className="mt-3 flex items-center gap-2 rounded border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
              <span className="material-symbols-outlined text-primary">swap_horiz</span>
              {result.tipo_movimiento === 'traslado' && result.lote_anterior ? (
                <span>
                  Animal movido: <strong>{result.lote_anterior.nombre}</strong>
                  {' → '}
                  <strong>{result.lote_nuevo.nombre}</strong>
                </span>
              ) : (
                <span>
                  Asignado al lote <strong>{result.lote_nuevo.nombre}</strong>
                </span>
              )}
            </div>
          )}
          {result.animal ? (
            <div className="mt-4 space-y-1 text-sm">
              <p><strong>Arete:</strong> {result.animal.numero_interno}</p>
              <p><strong>Raza:</strong> {result.animal.raza}</p>
              <p><strong>Peso:</strong> {result.animal.peso_actual ?? '—'} kg</p>
              <p><strong>Estado:</strong> {result.animal.estado_display}</p>
              <Link className="mt-3 inline-block text-primary hover:underline" to={`/animales/${result.animal.id}`}>
                Ver ficha completa →
              </Link>
            </div>
          ) : (
            <Link
              className="mt-4 inline-block rounded bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container"
              to={`/animales/nuevo?rfid=${encodeURIComponent(tag)}`}
            >
              Registrar animal con este tag
            </Link>
          )}
        </div>
      )}

      <section className="rounded-lg border border-outline-variant bg-surface-container">
        <h3 className="border-b border-outline-variant px-5 py-3 text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
          Historial de lecturas
        </h3>
        <div className="table-scroll">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant text-left text-xs uppercase text-on-surface-variant">
              <th className="px-5 py-2">Fecha</th>
              <th className="px-5 py-2">Tag</th>
              <th className="px-5 py-2">Animal</th>
              <th className="px-5 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((l) => (
              <tr key={l.id} className="border-b border-outline-variant/50">
                <td className="px-5 py-2.5 text-xs">{new Date(l.fecha_hora).toLocaleString('es-MX')}</td>
                <td className="px-5 py-2.5 font-mono text-xs">{l.rfid_tag_leido}</td>
                <td className="px-5 py-2.5">
                  {l.animal_numero ? (
                    <Link className="text-primary hover:underline" to={`/animales/${l.animal}`}>
                      {l.animal_numero}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-5 py-2.5">
                  <span className={`rounded px-2 py-0.5 text-xs ${l.procesado ? 'bg-primary/20 text-primary' : 'bg-tertiary/20 text-tertiary'}`}>
                    {l.procesado ? 'OK' : 'Pendiente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>
    </div>
  );
};

export default RfidScan;
