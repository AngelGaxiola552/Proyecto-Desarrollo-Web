const { z } = require('zod');

const portsPattern = /^(\d{1,5}(-\d{1,5})?(,\d{1,5}(-\d{1,5})?)*)$/;

const optionsSchema = z.object({
  scanType:       z.enum(['-sT', '-sS', '-sU']).default('-sT'),
  ports:          z.string().trim().regex(portsPattern, 'Formato de puertos inválido').optional(),
  topPorts:       z.number().int().min(1).max(1000).optional(),
  serviceVersion: z.boolean().default(false),
  osDetection:    z.boolean().default(false),
  timing:         z.number().int().min(2).max(4).default(3),
  noPing:         z.boolean().default(false),
  scripts:        z.enum(['none', 'default', 'safe']).default('none'),
});

const profileSchema = z.object({
  name:    z.string().trim().min(1, 'El nombre es obligatorio').max(60),
  options: optionsSchema,
});

const profileUpdateSchema = profileSchema.partial();

module.exports = { profileSchema, profileUpdateSchema, optionsSchema };
