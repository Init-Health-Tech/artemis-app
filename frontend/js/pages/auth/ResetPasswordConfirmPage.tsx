import { yupResolver } from '@hookform/resolvers/yup';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { Link, useParams } from 'react-router';

import authApi from '@/js/authApi';
import AuthCard from '@/js/components/layouts/AuthCard';
import AuthLayout from '@/js/components/layouts/AuthLayout';
import {
  resetPasswordConfirmSchema,
  type ResetPasswordConfirmFormValues,
} from '@/js/features/auth/schemas';

const RESET_SUCCESS_MESSAGES: Record<string, string> = {
  'Password has been reset. You can sign in now.':
    'Contraseña actualizada. Ya puedes iniciar sesión.',
};

const RESET_LINK_ERROR_MESSAGES: Record<string, string> = {
  'Invalid reset link.': 'El enlace de recuperación no es válido.',
  'Invalid or expired reset link.':
    'El enlace de recuperación no es válido o ha caducado.',
};

function formatResetApiError(err: unknown): string {
  if (!isAxiosError(err)) {
    return 'No se pudo actualizar la contraseña. Intenta de nuevo.';
  }
  const data = err.response?.data as Record<string, unknown> | undefined;
  if (!data) {
    return 'No se pudo actualizar la contraseña. Intenta de nuevo.';
  }
  if (typeof data.detail === 'string') {
    return RESET_LINK_ERROR_MESSAGES[data.detail] ?? data.detail;
  }
  const pwd = data.new_password;
  if (Array.isArray(pwd) && typeof pwd[0] === 'string') return pwd[0];
  if (typeof pwd === 'string') return pwd;
  const rePwd = data.re_new_password;
  if (Array.isArray(rePwd) && typeof rePwd[0] === 'string') {
    return rePwd[0] === 'Passwords do not match.'
      ? 'Las contraseñas no coinciden.'
      : rePwd[0];
  }
  return 'No se pudo actualizar la contraseña. Intenta de nuevo.';
}

const ResetPasswordConfirmPage = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const linkInvalid = !uid?.trim() || !token?.trim();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(
    linkInvalid ? 'El enlace de recuperación está incompleto.' : null,
  );
  const [showPassword, setShowPassword] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordConfirmFormValues>({
    resolver: yupResolver(
      resetPasswordConfirmSchema,
    ) as Resolver<ResetPasswordConfirmFormValues>,
    defaultValues: {
      new_password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ResetPasswordConfirmFormValues) => {
    if (linkInvalid || !uid || !token) return;

    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const { data } = await authApi.post<{ detail?: string }>(
        '/auth/password/reset/confirm/',
        {
          uid,
          token,
          new_password: values.new_password,
          re_new_password: values.confirmPassword,
        },
      );
      const detail = data?.detail;
      setSuccessMessage(
        detail && RESET_SUCCESS_MESSAGES[detail]
          ? RESET_SUCCESS_MESSAGES[detail]
          : 'Contraseña actualizada. Ya puedes iniciar sesión.',
      );
      reset();
    } catch (err) {
      setApiError(formatResetApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Nueva contraseña</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Elige una contraseña segura para tu cuenta.
          </p>
        </div>

        {successMessage ? (
          <div className="flex flex-col gap-4">
            <p className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              {successMessage}
            </p>
            <Link
              className="w-full rounded-xl bg-primary-container py-2.5 text-center font-semibold text-on-primary-container hover:opacity-90"
              to="/login"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <label className="block">
              <span className="mb-1 block text-sm text-on-surface-variant">
                Nueva contraseña
              </span>
              <div className="relative">
                <Controller
                  control={control}
                  name="new_password"
                  render={({ field }) => (
                    <input
                      {...field}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-outline-variant bg-surface-container-high px-3 py-2.5 pr-12 text-on-surface focus:border-primary focus:outline-none"
                      disabled={linkInvalid}
                      type={showPassword ? 'text' : 'password'}
                    />
                  )}
                />
                <button
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-on-surface-variant"
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.new_password ? (
                <p className="mt-1 text-sm text-error">{errors.new_password.message}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-on-surface-variant">
                Confirmar contraseña
              </span>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <input
                    {...field}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-high px-3 py-2.5 text-on-surface focus:border-primary focus:outline-none"
                    disabled={linkInvalid}
                    type={showPassword ? 'text' : 'password'}
                  />
                )}
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-sm text-error">{errors.confirmPassword.message}</p>
              ) : null}
            </label>

            <button
              className="w-full rounded-xl bg-primary-container py-2.5 font-semibold text-on-primary-container hover:opacity-90 disabled:opacity-50"
              disabled={isSubmitting || linkInvalid}
              type="submit"
            >
              {isSubmitting ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        )}

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

export default ResetPasswordConfirmPage;
