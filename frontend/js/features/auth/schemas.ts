import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('El correo es obligatorio')
    .email('Ingresa un correo válido'),
  password: yup.string().required('La contraseña es obligatoria'),
});

export const resetPasswordSchema = yup.object({
  email: yup
    .string()
    .required('El correo es obligatorio')
    .email('Ingresa un correo válido'),
});

export const resetPasswordConfirmSchema = yup.object({
  new_password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: yup
    .string()
    .required('Confirma tu contraseña')
    .oneOf([yup.ref('new_password')], 'Las contraseñas no coinciden'),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;
export type ResetPasswordFormValues = yup.InferType<typeof resetPasswordSchema>;
export type ResetPasswordConfirmFormValues = yup.InferType<typeof resetPasswordConfirmSchema>;
