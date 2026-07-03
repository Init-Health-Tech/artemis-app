import { NavLink, Outlet, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';

import { authApi } from '@/js/api/ganado';
import ArtemisLogo from '@/js/components/ArtemisLogo';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/animales', label: 'Animales', icon: 'pets' },
  { to: '/estados', label: 'Estados', icon: 'swap_horiz' },
  { to: '/rfid', label: 'RFID', icon: 'nfc' },
  { to: '/lotes', label: 'Lotes', icon: 'grass' },
  { to: '/inventario', label: 'Inventario', icon: 'inventory_2' },
];

const AppLayout = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/login');
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-on-surface-variant">
        Verificando sesión...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed left-0 top-0 flex h-full w-[260px] flex-col border-r border-outline-variant bg-surface-container-low">
        <div className="flex h-16 items-center border-b border-outline-variant px-5">
          <ArtemisLogo size="sm" subtitle="Ganado bovino" textClassName="text-base" />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'border-l-2 border-primary bg-surface-container text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                ].join(' ')
              }
              end={item.to === '/'}
              to={item.to}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-outline-variant p-4 text-xs text-on-surface-variant">
          <div>{email}</div>
          <button
            className="mt-2 text-primary hover:underline"
            type="button"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="ml-[260px] flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-outline-variant bg-surface-container px-6">
          <ArtemisLogo showText={false} size="sm" />
          <div>
            <h1 className="text-sm font-semibold text-on-surface">ArtemisApp</h1>
            <p className="text-xs text-on-surface-variant">Control de ganado bovino</p>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
