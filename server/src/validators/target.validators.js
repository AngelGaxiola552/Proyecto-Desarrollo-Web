const { z } = require('zod');
const net = require('net');

const hostSchema = z.string().trim().refine((val) => {
  // Acepta IP válida o hostname (letras, dígitos, guiones, puntos)
  if (net.isIP(val)) return true;
  return /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/.test(val);
}, 'Host inválido: debe ser una IP o un hostname válido');

const targetSchema = z.object({
  alias: z.string().trim().min(1, 'El alias es obligatorio').max(60),
  host:  hostSchema,
  tags:  z.array(z.string().trim().max(30)).max(10).default([]),
  notes: z.string().trim().max(500).default(''),
});

const targetUpdateSchema = targetSchema.partial();

module.exports = { targetSchema, targetUpdateSchema };
