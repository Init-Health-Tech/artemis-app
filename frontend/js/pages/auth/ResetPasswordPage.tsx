import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { Link } from 'react-router';

import authApi from '@/js/authApi';
import AuthCard from '@/js/components/layouts/AuthCard';
import AuthLayout from '@/js/components/layouts/AuthLayout';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/js/features/auth/schemas';

const ResetPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(resetPasswordSchema) as Resolver<ResetPasswordFormValues>,
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);
    try {
      await authApi.post('/auth/password/reset/', { email: values.email });
      setSuccessMessage(
        'Si el correo existe en ArtemisApp, te enviaremos instrucciones para recuperar tu contraseña.',
      );
      reset();
    } catch {
      setApiError('No se pudo procesar la solicitud en este momento. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Recuperar contraseña</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Ingresa tu correo y te enviaremos el enlace de recuperación.
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
          <button
            className="w-full rounded-xl bg-primary-container py-2.5 font-semibold text-on-primary-container hover:opacity-90 disabled:opacity-50"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Enviando…' : 'Recibir enlace'}
          </button>
        </form>

        {successMessage ? (
          <p className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
            {successMessage}
          </p>
        ) : null}
        {apiError ? (
          <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
            {apiError}
          </p>
        ) : null}

        <p className="text-center text-sm">
          <Link className="text-primary hover:underline" to="/login">
            Volver a iniciar sesión
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
