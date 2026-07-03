export interface TimelineItem {
  tipo_item: string;
  fecha: string;
  titulo: string;
  descripcion: string;
  icono: string;
  metadata: Record<string, unknown>;
}

interface TraceabilityTimelineProps {
  items: TimelineItem[];
}

const TraceabilityTimeline = ({ items }: TraceabilityTimelineProps) => (
  <div className="relative space-y-0">
    <div className="absolute bottom-0 left-[19px] top-0 w-px bg-outline-variant" />
    {items.map((item) => (
      <div key={`${item.tipo_item}-${item.fecha}-${item.titulo}`} className="relative flex gap-4 pb-6">
        <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high">
          <span className="material-symbols-outlined text-[18px] text-primary">{item.icono}</span>
        </div>
        <div className="flex-1 rounded-lg border border-outline-variant bg-surface-container p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-semibold text-on-surface">{item.titulo}</h4>
            <time className="text-xs text-on-surface-variant">
              {new Date(item.fecha).toLocaleString('es-MX')}
            </time>
          </div>
          <p className="mt-1 text-sm text-on-surface-variant">{item.descripcion}</p>
          {item.metadata?.valor_numerico && (
            <p className="mt-2 text-xs font-medium text-primary">
              Valor: {String(item.metadata.valor_numerico)} kg
            </p>
          )}
          {item.metadata?.severidad && item.metadata.severidad !== 'moderada' && (
            <span className="mt-2 inline-block rounded bg-tertiary/20 px-2 py-0.5 text-xs text-tertiary">
              Severidad: {String(item.metadata.severidad)}
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default TraceabilityTimeline;
