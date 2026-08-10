import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router';

import AuthCard from '@/js/components/layouts/AuthCard';
import AuthLayout from '@/js/components/layouts/AuthLayout';
import { loginUser } from '@/js/features/auth/authSlice';
import { loginSchema, type LoginFormValues } from '@/js/features/auth/schemas';
import type { AppDispatch, RootState } from '@/js/store';
import {
  AUTHENTICATED_DEFAULT_PATH,
  isSafeInternalRedirect,
} from '@/js/utils/authRoutes';

type LoginLocationState = {
  successMessage?: string;
};

const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const successFromState =
    (location.state as LoginLocationState | null)?.successMessage ?? null;
  const isLoading = useSelector((s: RootState) => s.auth.isLoading);
  const error = useSelector((s: RootState) => s.auth.error);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const demoEmail =
    document.querySelector('meta[name="artemis-demo-email"]')?.getAttribute('content') || '';

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema) as Resolver<LoginFormValues>,
    defaultValues: {
      email: demoEmail || '',
      password: demoEmail ? 'demo123' : '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      await dispatch(
        loginUser({ email: values.email, password: values.password }),
      ).unwrap();
      const redirect = new URLSearchParams(location.search).get('redirect');
      navigate(
        redirect && isSafeInternalRedirect(redirect)
          ? redirect
          : AUTHENTICATED_DEFAULT_PATH,
        { replace: true },
      );
    } catch {
      /* rejected in slice */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Accede a tu cuenta de ArtemisApp
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="mb-1 block text-sm text-on-surface-variant">Correo</span>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <input
                  {...field}
                  autoComplete="email"
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-high px-3 py-2.5 text-on-surface focus:border-primary focus:outline-none"
                  type="email"
                />
              )}
            />
            {errors.email ? (
              <p className="mt-1 text-sm text-error">{errors.email.message}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-on-surface-variant">Contraseña</span>
            <div className="relative">
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <input
                    {...field}
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-high px-3 py-2.5 pr-12 text-on-surface focus:border-primary focus:outline-none"
                    type={showPassword ? 'text' : 'password'}
                  />
                )}
              />
              <button
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container"
                type="button"
                onClick={() => setShowPassword((p) => !p)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password ? (
              <p className="mt-1 text-sm text-error">{errors.password.message}</p>
            ) : null}
          </label>

          <Link
            className="self-end text-sm text-primary hover:underline"
            to="/recuperar-contrasena"
          >
            ¿Olvidaste tu contraseña?
          </Link>

          <button
            className="w-full rounded-xl bg-primary-container py-2.5 font-semibold text-on-primary-container hover:opacity-90 disabled:opacity-50"
            disabled={submitting || isLoading}
            type="submit"
          >
            {submitting ? 'Entrando…' : 'Continuar'}
          </button>
        </form>

        {successFromState ? (
          <p className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
            {successFromState}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
            {error}
          </p>
        ) : null}

        <p className="text-center text-sm text-on-surface-variant">
          <Link className="text-primary hover:underline" to="/">
            ← Volver al inicio
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default LoginPage;
