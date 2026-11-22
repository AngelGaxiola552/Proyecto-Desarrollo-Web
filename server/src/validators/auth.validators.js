const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(60, 'Máximo 60 caracteres'),
  email: z.string().trim().email('Formato de correo inválido').toLowerCase(),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Formato de correo inválido').toLowerCase(),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

module.exports = { registerSchema, loginSchema };
