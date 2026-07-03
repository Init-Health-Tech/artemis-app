import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { authApi } from '@/js/api/ganado';
import ArtemisLogo from '@/js/components/ArtemisLogo';

const Login = () => {
  const [email, setEmail] = useState('admin@artemis.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [csrfReady, setCsrfReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    authApi.session().finally(() => setCsrfReady(true));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.login(email, password);
      navigate('/');
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
      </form>
    </div>
  );
};

export default Login;
