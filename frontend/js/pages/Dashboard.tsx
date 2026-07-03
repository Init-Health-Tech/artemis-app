import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { DashboardData, ganadoApi } from '@/js/api/ganado';
import ArtemisLogo from '@/js/components/ArtemisLogo';
import DashboardAlertsFeed from '@/js/components/dashboard/DashboardAlertsFeed';
import DashboardCharts from '@/js/components/dashboard/DashboardCharts';
import DashboardKpiCard from '@/js/components/dashboard/DashboardKpiCard';
import DemoBanner from '@/js/components/DemoBanner';

const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-16 rounded-2xl bg-surface-container" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 rounded-2xl bg-surface-container" />
      ))}
    </div>
    <div className="h-80 rounded-2xl bg-surface-container" />
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    ganadoApi.dashboard().then((res) => setData(res.data));
  }, [searchParams]);

  if (!data) return <DashboardSkeleton />;

  const resumen = data.resumen_hato;
  const alertasCount = data.alertas_activas_count ?? data.alertas_accionables?.length ?? 0;
  const hoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6">
      <DemoBanner />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <ArtemisLogo showText={false} size="lg" />
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Panel de control</p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-on-surface md:text-3xl">
              Resumen del hato
            </h1>
            <p className="mt-1 capitalize text-sm text-on-surface-variant">{hoy}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-high px-4 py-2 text-sm font-medium transition hover:border-primary/40"
            to="/rfid"
          >
            <span className="material-symbols-outlined text-[18px]">nfc</span>
            Escanear RFID
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container transition hover:opacity-90"
            to="/animales/nuevo"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nuevo animal
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardKpiCard
          icon="pets"
          label="Animales activos"
          subtitle={`${resumen?.total_registrados ?? 0} registrados en total`}
          to="/animales?estado=activo"
          trend={`${resumen?.eventos_hoy ?? 0} eventos hoy`}
          value={data.animales_activos}
          variant="success"
        />
        <DashboardKpiCard
          icon="scale"
          label="Peso promedio"
          subtitle="Hato activo"
          to="/animales?estado=activo"
          value={resumen?.peso_promedio_kg != null ? `${resumen.peso_promedio_kg} kg` : '—'}
        />
        <DashboardKpiCard
          icon="grass"
          label="Ocupación global"
          subtitle={`${resumen?.ocupacion_total ?? 0} / ${resumen?.capacidad_total ?? 0} espacios`}
          to="/lotes"
          value={`${resumen?.ocupacion_global_pct ?? 0}%`}
          variant={(resumen?.ocupacion_global_pct ?? 0) > 90 ? 'warning' : 'default'}
        />
        <DashboardKpiCard
          icon="notifications_active"
          label="Alertas activas"
          subtitle={`${data.animales_cuarentena ?? 0} en cuarentena`}
          to="/animales?estado=cuarentena"
          value={alertasCount}
          variant={alertasCount > 0 ? 'danger' : 'default'}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardKpiCard
          icon="coronavirus"
          label="Cuarentena"
          to="/estados?estado=cuarentena"
          value={data.animales_cuarentena ?? 0}
          variant={(data.animales_cuarentena ?? 0) > 0 ? 'warning' : 'default'}
        />
        <DashboardKpiCard
          icon="stethoscope"
          label="Revisiones 7d"
          to="/animales?estado=activo"
          value={data.revisiones_pendientes_count ?? 0}
          variant={(data.revisiones_pendientes_count ?? 0) > 0 ? 'warning' : 'default'}
        />
        <DashboardKpiCard
          icon="nfc"
          label={`Sin RFID (${data.dias_sin_lectura}d)`}
          subtitle={`${resumen?.lecturas_rfid_hoy ?? 0} lecturas hoy`}
          to="/rfid"
          value={data.animales_sin_lectura}
          variant={data.animales_sin_lectura > 0 ? 'warning' : 'default'}
        />
        <DashboardKpiCard
          icon="inventory_2"
          label="Stock bajo"
          to="/inventario"
          value={data.alertas_stock.length}
          variant={data.alertas_stock.length > 0 ? 'danger' : 'default'}
        />
      </div>

      <DashboardCharts data={data} />

      <DashboardAlertsFeed
        alertas={data.alertas_accionables ?? []}
        eventos={data.ultimos_eventos}
        lecturas={data.ultimas_lecturas ?? []}
      />
    </div>
  );
};

export default Dashboard;
