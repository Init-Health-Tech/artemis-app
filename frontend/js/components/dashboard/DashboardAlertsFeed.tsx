import { Link } from 'react-router';

import { DashboardAlerta, EventoAnimal, LecturaRFID } from '@/js/api/ganado';

const severidadIcon: Record<string, string> = {
  alta: 'error',
  media: 'warning',
  baja: 'info',
};

const severidadColor: Record<string, string> = {
  alta: 'border-error/30 bg-error/5',
  media: 'border-tertiary/30 bg-tertiary/5',
  baja: 'border-primary/30 bg-primary/5',
};

interface Props {
  alertas: DashboardAlerta[];
  eventos: EventoAnimal[];
  lecturas: LecturaRFID[];
}

const DashboardAlertsFeed = ({ alertas, eventos, lecturas }: Props) => (
  <div className="grid gap-6 lg:grid-cols-5">
    {alertas.length > 0 && (
      <section className="rounded-2xl border border-error/20 bg-gradient-to-br from-error/5 to-surface-container p-5 lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-error">notifications_active</span>
          <h2 className="text-sm font-semibold">Alertas ({alertas.length})</h2>
        </div>
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {alertas.map((alerta) => (
            <div
              key={`${alerta.tipo}-${alerta.titulo}`}
              className={`flex items-start gap-3 rounded-xl border p-3 ${severidadColor[alerta.severidad] ?? severidadColor.media}`}
            >
              <span className="material-symbols-outlined mt-0.5 text-[18px] text-on-surface-variant">
                {severidadIcon[alerta.severidad] ?? 'info'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{alerta.titulo}</p>
                <p className="mt-0.5 text-xs text-on-surface-variant">{alerta.descripcion}</p>
                <Link
                  className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                  to={alerta.link}
                >
                  {alerta.link_label} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    )}

    <section className={`rounded-2xl border border-outline-variant/60 bg-surface-container ${alertas.length > 0 ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
      <div className="grid divide-y divide-outline-variant/40 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <div>
          <div className="border-b border-outline-variant/40 px-5 py-3">
            <h2 className="text-sm font-semibold">Últimos eventos</h2>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {eventos.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 border-b border-outline-variant/30 px-5 py-3 last:border-0 hover:bg-surface-container-high"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <span className="material-symbols-outlined text-[16px] text-primary">event_note</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Link className="truncate text-sm font-medium text-primary hover:underline" to={`/animales/${e.animal}`}>
                      {e.animal_numero_interno}
                    </Link>
                    <span className="shrink-0 text-[10px] text-on-surface-variant">
                      {new Date(e.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{e.tipo_display}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between border-b border-outline-variant/40 px-5 py-3">
            <h2 className="text-sm font-semibold">Lecturas RFID</h2>
            <Link className="text-xs text-primary hover:underline" to="/rfid">
              Escáner →
            </Link>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {lecturas.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-3 border-b border-outline-variant/30 px-5 py-3 last:border-0 hover:bg-surface-container-high"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                  <span className="material-symbols-outlined text-[16px] text-secondary">nfc</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-xs">{l.rfid_tag_leido}</span>
                    <span className="shrink-0 text-[10px] text-on-surface-variant">
                      {new Date(l.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {l.animal_numero ? (
                      <Link className="text-primary hover:underline" to={`/animales/${l.animal}`}>
                        {l.animal_numero}
                      </Link>
                    ) : (
                      <span className="text-tertiary">No registrado</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default DashboardAlertsFeed;
