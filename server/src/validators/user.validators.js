const { z } = require('zod');

const updateMeSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .optional(),
});

const deleteMeSchema = z.object({
  password: z.string().min(1, 'La contraseña es obligatoria para eliminar la cuenta'),
});

const adminCreateSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  role: z.enum(['user', 'admin']).default('user'),
});

const adminUpdateSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).optional(),
  role: z.enum(['user', 'admin']).optional(),
});

module.exports = { updateMeSchema, deleteMeSchema, adminCreateSchema, adminUpdateSchema };
