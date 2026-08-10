import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';

import authApi from '@/js/authApi';
import AuthCard from '@/js/components/layouts/AuthCard';
import AuthLayout from '@/js/components/layouts/AuthLayout';

const ActivatePage = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('Activando tu cuenta…');

  useEffect(() => {
    if (!uid?.trim() || !token?.trim()) {
      setStatus('error');
      setMessage('El enlace de activación está incompleto.');
      return;
    }

    void authApi
      .post<{ detail?: string }>('/auth/activate/', { uid, token })
      .then((res) => {
        setStatus('ok');
        setMessage(res.data.detail || 'Tu cuenta ha sido activada.');
      })
      .catch(() => {
        setStatus('error');
        setMessage('El enlace de activación no es válido o ha caducado.');
      });
  }, [uid, token]);

  return (
    <AuthLayout>
      <AuthCard>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Activación de cuenta</h1>
          <p
            className={[
              'mt-4 rounded-xl px-3 py-2 text-sm',
              status === 'ok'
                ? 'border border-primary/30 bg-primary/10 text-primary'
                : status === 'error'
                  ? 'border border-error/30 bg-error/10 text-error'
                  : 'text-on-surface-variant',
            ].join(' ')}
          >
            {message}
          </p>
        </div>
        {status !== 'loading' ? (
          <Link
            className="w-full rounded-xl bg-primary-container py-2.5 text-center font-semibold text-on-primary-container hover:opacity-90"
            to="/login"
          >
            Ir a iniciar sesión
          </Link>
        ) : null}
      </AuthCard>
    </AuthLayout>
  );
};

export default ActivatePage;
