import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';

import { authApi } from '@/js/api/ganado';
import ArtemisLogo from '@/js/components/ArtemisLogo';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/animales', label: 'Animales', icon: 'pets' },
  { to: '/estados', label: 'Estados', icon: 'swap_horiz' },
  { to: '/rfid', label: 'RFID', icon: 'nfc' },
  { to: '/lotes', label: 'Lotes', icon: 'grass' },
  { to: '/inventario', label: 'Inventario', icon: 'inventory_2' },
];

const AppLayout = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    authApi
      .session()
      .then((res) => {
        if (!res.data.authenticated) {
          navigate('/login');
        } else {
          setEmail(res.data.email ?? null);
          setReady(true);
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/');
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-on-surface-variant">
        Verificando sesión...
      </div>
    );
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
      isActive
        ? 'border-l-2 border-primary bg-surface-container text-primary'
        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
    ].join(' ');

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-background">
      {menuOpen && (
        <button
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          type="button"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={[
          'fixed left-0 top-0 z-50 flex h-full w-[min(100vw-2.5rem,280px)] flex-col',
          'border-r border-outline-variant bg-surface-container-low',
          'transition-transform duration-200 ease-out',
          'lg:w-[260px] lg:translate-x-0',
          menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-14 items-center justify-between border-b border-outline-variant px-4 lg:h-16 lg:px-5">
          <ArtemisLogo size="sm" subtitle="Ganado bovino" textClassName="text-base" />
          <button
            aria-label="Cerrar menú"
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container lg:hidden"
            type="button"
            onClick={() => setMenuOpen(false)}
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={navLinkClass}
              end={item.to === '/dashboard'}
              to={item.to}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-outline-variant p-4 text-xs text-on-surface-variant">
          <div className="truncate">{email}</div>
          <button
            className="mt-2 min-h-[44px] text-primary hover:underline"
            type="button"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:ml-[260px]">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-outline-variant bg-surface-container/95 px-4 backdrop-blur sm:px-6 lg:h-16">
          <button
            aria-expanded={menuOpen}
            aria-label="Abrir menú"
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high lg:hidden"
            type="button"
            onClick={() => setMenuOpen(true)}
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <ArtemisLogo showText={false} size="sm" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold text-on-surface">ArtemisApp</h1>
            <p className="truncate text-xs text-on-surface-variant">Control de ganado bovino</p>
          </div>
        </header>
        <main className="flex-1 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
