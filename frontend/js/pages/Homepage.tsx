import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';

import { authApi } from '@/js/api/ganado';
import ArtemisLogo from '@/js/components/ArtemisLogo';

const features = [
  {
    icon: 'dashboard',
    title: 'Panel ejecutivo',
    description: 'KPIs del hato, ocupación de lotes, alertas de stock y actividad operativa en tiempo real.',
  },
  {
    icon: 'pets',
    title: 'Registro de animales',
    description: 'Ficha completa por arete y RFID: peso, raza, lote, historial sanitario y fotos.',
  },
  {
    icon: 'nfc',
    title: 'Trazabilidad RFID',
    description: 'Escaneo en campo, traslados automáticos entre potreros y lecturas auditables.',
  },
  {
    icon: 'grass',
    title: 'Lotes y potreros',
    description: 'Capacidad, ocupación, ADG y tendencias de peso promedio por corral.',
  },
  {
    icon: 'swap_horiz',
    title: 'Estados del hato',
    description: 'Cuarentena, venta, baja y altas sanitarias con motivo y trazabilidad.',
  },
  {
    icon: 'inventory_2',
    title: 'Inventario de alimento',
    description: 'Stock, consumos, entradas y alertas cuando el inventario baja del mínimo.',
  },
];

const steps = [
  { n: '01', title: 'Registra el hato', text: 'Alta de animales con RFID, lote y datos zootecnicos.' },
  { n: '02', title: 'Opera en campo', text: 'Escanea tags, registra eventos y mueve animales entre potreros.' },
  { n: '03', title: 'Toma decisiones', text: 'Dashboard con alertas accionables y reportes del rancho.' },
];

const Homepage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    authApi.session().then((res) => {
      if (res.data.authenticated) navigate('/dashboard', { replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="sticky top-0 z-50 border-b border-outline-variant/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <ArtemisLogo size="sm" subtitle="Ganado bovino" />
          <Link
            className="shrink-0 rounded-xl bg-primary-container px-4 py-2.5 text-sm font-semibold text-on-primary-container transition hover:opacity-90 sm:px-5"
            to="/login"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(147,214,149,0.12)_0%,_transparent_55%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Gestión ganadera moderna
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Control total de tu ganado bovino, en un solo lugar
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-on-surface-variant">
              ArtemisApp centraliza animales, lecturas RFID, lotes, inventario de alimento y estados
              sanitarios para ranchos, engorda y operaciones con trazabilidad en México.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-xl bg-primary-container px-6 py-3 font-semibold text-on-primary-container transition hover:opacity-90"
                to="/login"
              >
                Entrar a la plataforma
              </Link>
              <a
                className="rounded-xl border border-outline-variant px-6 py-3 font-medium text-on-surface-variant transition hover:border-primary/40 hover:text-primary"
                href="#modulos"
              >
                Ver módulos
              </a>
            </div>
            <p className="mt-6 text-sm text-on-surface-variant">
              Demo disponible · Español (México) · Dark mode optimizado para campo
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="rounded-3xl border border-outline-variant/60 bg-surface-container p-6 shadow-2xl shadow-primary/5 sm:p-10">
              <ArtemisLogo showText={false} size="xl" />
              <ul className="mt-8 space-y-3 text-sm text-on-surface-variant">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                  Trazabilidad por animal y por lote
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                  Alertas de stock, cuarentena y sobrepoblación
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
                  API REST y panel administrativo Django
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-outline-variant/60 bg-surface-container px-4 py-12 sm:px-6 sm:py-16" id="modulos">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold md:text-3xl">Todo lo que necesita tu operación</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-on-surface-variant">
            Módulos integrados para el día a día del rancho: desde el corral hasta la oficina.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <article
                key={f.title}
                className="rounded-2xl border border-outline-variant/60 bg-surface-container-high p-6 transition hover:border-primary/30"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
                  <span className="material-symbols-outlined text-primary">{f.icon}</span>
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold">Cómo funciona</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-outline-variant/60 bg-surface-container p-6"
              >
                <span className="text-3xl font-bold text-primary/40">{s.n}</span>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-on-surface-variant">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-outline-variant/60 bg-surface-container px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Listo para conocer ArtemisApp</h2>
          <p className="mt-4 text-on-surface-variant">
            Accede con tus credenciales de demo o solicita una presentación para tu operación ganadera.
          </p>
          <Link
            className="mt-8 inline-block rounded-xl bg-primary-container px-8 py-3 font-semibold text-on-primary-container transition hover:opacity-90"
            to="/login"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>

      <footer className="border-t border-outline-variant/60 px-4 py-8 text-center text-sm text-on-surface-variant sm:px-6">
        ArtemisApp · Control de ganado bovino
      </footer>
    </div>
  );
};

export default Homepage;
