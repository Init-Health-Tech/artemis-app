import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { authApi } from '@/js/api/ganado';
import ArtemisLogo from '@/js/components/ArtemisLogo';

const Login = () => {
  const demoEmail =
    document.querySelector('meta[name="artemis-demo-email"]')?.getAttribute('content') || '';
  const [email, setEmail] = useState(demoEmail || 'admin@artemis.local');
  const [password, setPassword] = useState(demoEmail ? 'demo123' : 'admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [csrfReady, setCsrfReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    authApi
      .session()
      .then((res) => {
        if (res.data.authenticated) navigate('/dashboard', { replace: true });
      })
      .finally(() => setCsrfReady(true));
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        className="w-full max-w-sm rounded-2xl border border-outline-variant bg-surface-container p-8 shadow-xl shadow-black/20"
        onSubmit={handleSubmit}
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <ArtemisLogo showText={false} size="xl" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">ArtemisApp</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Control de ganado bovino</p>
        </div>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm text-on-surface-variant">Email</span>
          <input
            className="w-full rounded-xl border border-outline-variant bg-surface-container-high px-3 py-2.5 text-on-surface focus:border-primary focus:outline-none"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="mb-6 block">
          <span className="mb-1 block text-sm text-on-surface-variant">Contraseña</span>
          <input
            className="w-full rounded-xl border border-outline-variant bg-surface-container-high px-3 py-2.5 text-on-surface focus:border-primary focus:outline-none"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="mb-4 text-sm text-error">{error}</p>}
        <button
          className="w-full rounded-xl bg-primary-container py-2.5 font-semibold text-on-primary-container hover:opacity-90 disabled:opacity-50"
          disabled={loading || !csrfReady}
          type="submit"
        >
          {loading ? 'Entrando...' : csrfReady ? 'Iniciar sesión' : 'Preparando...'}
        </button>
        <p className="mt-6 text-center text-sm text-on-surface-variant">
          <Link className="text-primary hover:underline" to="/">
            ← Volver al inicio
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
