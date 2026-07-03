import type { ReactNode } from 'react';
import { Link } from 'react-router';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { DashboardData } from '@/js/api/ganado';
import { chartAxisProps, chartGridProps, chartTooltipStyle, CHART } from '@/js/components/dashboard/chartTheme';

interface Props {
  data: DashboardData;
}

const Panel = ({ title, subtitle, children, action }: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) => (
  <section className="rounded-2xl border border-outline-variant/60 bg-surface-container p-5">
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold text-on-surface">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-on-surface-variant">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const DashboardCharts = ({ data }: Props) => {
  const ocupacion = (data.ocupacion_lotes ?? []).map((l) => ({
    nombre: l.nombre.length > 14 ? `${l.nombre.slice(0, 12)}…` : l.nombre,
    ocupacion: l.capacidad_usada_pct,
    animales: l.animales_activos_count,
    capacidad: l.capacidad,
    id: l.id,
  }));

  const adg = (data.adg_por_lote ?? []).map((l) => ({
    nombre: l.lote_nombre.length > 12 ? `${l.lote_nombre.slice(0, 10)}…` : l.lote_nombre,
    adg: l.adg_kg_dia,
    id: l.lote_id,
  }));

  const actividad = data.actividad_semanal ?? [];
  const estados = data.distribucion_estado ?? [];
  const eventosTipo = data.eventos_por_tipo ?? [];
  const pesoTendencia = data.peso_promedio_tendencia ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <Panel subtitle="Últimos 7 días" title="Actividad operativa">
          <div className="h-56">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={actividad} barGap={4}>
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="label" {...chartAxisProps} />
                <YAxis allowDecimals={false} {...chartAxisProps} width={28} />
                <Tooltip {...chartTooltipStyle} />
                <Legend
                  formatter={(v) => (v === 'eventos' ? 'Eventos' : 'Lecturas RFID')}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: '#c0c9bc' }}
                />
                <Bar dataKey="eventos" fill={CHART.colors[0]} name="eventos" radius={[6, 6, 0, 0]} />
                <Bar dataKey="lecturas_rfid" fill={CHART.colors[2]} name="lecturas_rfid" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="grid gap-6 md:grid-cols-2">
          <Panel subtitle="% de capacidad utilizada" title="Ocupación por lote">
            <div className="h-52">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={ocupacion} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid {...chartGridProps} horizontal={false} />
                  <XAxis domain={[0, 'dataMax + 10']} type="number" {...chartAxisProps} unit="%" />
                  <YAxis dataKey="nombre" type="category" width={72} {...chartAxisProps} />
                  <Tooltip
                    {...chartTooltipStyle}
                    formatter={(v: number, _n, p) => [
                      `${v}% (${p.payload.animales}/${p.payload.capacidad})`,
                      'Ocupación',
                    ]}
                  />
                  <Bar dataKey="ocupacion" radius={[0, 6, 6, 0]}>
                    {ocupacion.map((entry) => (
                      <Cell
                        key={entry.id}
                        fill={entry.ocupacion > 100 ? CHART.colors[5] : entry.ocupacion > 85 ? CHART.colors[2] : CHART.colors[0]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(data.ocupacion_lotes ?? []).map((l) => (
                <Link
                  key={l.id}
                  className="rounded-full border border-outline-variant/50 px-3 py-1 text-xs text-on-surface-variant hover:border-primary/40 hover:text-primary"
                  to={`/lotes/${l.id}`}
                >
                  {l.nombre}
                </Link>
              ))}
            </div>
          </Panel>

          <Panel subtitle="Ganancia diaria de peso" title="ADG por lote">
            {adg.length === 0 ? (
              <p className="py-12 text-center text-sm text-on-surface-variant">Sin datos de pesaje suficientes</p>
            ) : (
              <div className="h-52">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={adg}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis dataKey="nombre" {...chartAxisProps} />
                    <YAxis {...chartAxisProps} unit=" kg" width={36} />
                    <Tooltip {...chartTooltipStyle} formatter={(v: number) => [`${v} kg/día`, 'ADG']} />
                    <Bar dataKey="adg" fill={CHART.colors[1]} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </div>

        {pesoTendencia.length >= 2 && (
          <Panel subtitle="Promedio del hato según pesajes registrados" title="Evolución de peso">
            <div className="h-48">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={pesoTendencia}>
                  <CartesianGrid {...chartGridProps} />
                  <XAxis
                    dataKey="fecha"
                    {...chartAxisProps}
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
                    }
                  />
                  <YAxis {...chartAxisProps} unit=" kg" width={40} />
                  <Tooltip
                    {...chartTooltipStyle}
                    formatter={(v: number) => [`${v} kg`, 'Peso promedio']}
                    labelFormatter={(v) => new Date(v).toLocaleDateString('es-MX')}
                  />
                  <Bar dataKey="peso_promedio" fill={CHART.colors[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}
      </div>

      <div className="space-y-6">
        <Panel title="Estado del hato">
          <div className="h-52">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={estados}
                  dataKey="total"
                  innerRadius={52}
                  nameKey="label"
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {estados.map((_, i) => (
                    <Cell key={estados[i].estado} fill={CHART.colors[i % CHART.colors.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#c0c9bc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel subtitle="Últimos 30 días" title="Eventos por tipo">
          <div className="space-y-3">
            {eventosTipo.map((e, i) => {
              const max = eventosTipo[0]?.total ?? 1;
              const pct = Math.round((e.total / max) * 100);
              return (
                <div key={e.tipo}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-on-surface-variant">{e.label}</span>
                    <span className="font-medium text-on-surface">{e.total}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container-highest">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: CHART.colors[i % CHART.colors.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {(data.stock_dias_restantes ?? []).length > 0 && (
          <Panel
            action={
              <Link className="text-xs text-primary hover:underline" to="/inventario">
                Ver todo
              </Link>
            }
            title="Stock de alimento"
          >
            <div className="space-y-3">
              {(data.stock_dias_restantes ?? []).map((item) => (
                <div
                  key={item.alimento_id}
                  className={`rounded-xl px-3 py-2.5 ${item.stock_bajo ? 'bg-error/10' : 'bg-surface-container-high'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{item.nombre}</span>
                    <span className={`text-sm font-bold ${item.stock_bajo ? 'text-error' : 'text-primary'}`}>
                      {item.dias_restantes}d
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-on-surface-variant">días estimados restantes</p>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
};

export default DashboardCharts;
