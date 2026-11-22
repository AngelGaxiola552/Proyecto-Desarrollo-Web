// GET /api/activity — Bitácora con filtros y paginado (solo lectura)
// Usuario ve solo sus eventos; admin ve todos.
const { activity } = require('../data/store');

function listActivity(req, res) {
  const { action = '', from = '', to = '', userId: qUserId = '', page = '1', limit = '20' } = req.query;

  let result = req.user.role === 'admin' ? [...activity] : activity.filter((e) => e.userId === req.user.id);

  // Admin puede filtrar por userId
  if (req.user.role === 'admin' && qUserId) result = result.filter((e) => e.userId === qUserId);
  if (action) result = result.filter((e) => e.action.includes(action));
  if (from)   result = result.filter((e) => new Date(e.timestamp) >= new Date(from));
  if (to)     result = result.filter((e) => new Date(e.timestamp) <= new Date(to));

  // Ordenado por fecha descendente (ya viene así del logger)
  const total  = result.length;
  const pageN  = Math.max(1, parseInt(page));
  const limitN = Math.min(100, Math.max(1, parseInt(limit)));
  res.json({ items: result.slice((pageN - 1) * limitN, pageN * limitN), total, page: pageN, pages: Math.ceil(total / limitN) });
}

module.exports = { listActivity };
