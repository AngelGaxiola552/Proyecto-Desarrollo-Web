const { z } = require('zod');
const { optionsSchema } = require('./profile.validators');

const scanCreateSchema = z.object({
  name:        z.string().trim().min(1).max(100).optional(),
  targetId:    z.string().optional(),
  hostSnapshot:z.string().trim().optional(), // host libre si no hay targetId
  profileId:   z.string().optional(),
  options:     optionsSchema.optional(),
  tags:        z.array(z.string().trim().max(30)).max(10).default([]),
  notes:       z.string().trim().max(500).default(''),
  authorized:  z.literal(true, { errorMap: () => ({ message: 'Debes confirmar que tienes autorización' }) }),
});

const scanUpdateSchema = z.object({
  name:  z.string().trim().min(1).max(100).optional(),
  notes: z.string().trim().max(500).optional(),
  tags:  z.array(z.string().trim().max(30)).max(10).optional(),
});

const previewSchema = z.object({
  host:    z.string().trim().min(1),
  options: optionsSchema,
});

module.exports = { scanCreateSchema, scanUpdateSchema, previewSchema };
