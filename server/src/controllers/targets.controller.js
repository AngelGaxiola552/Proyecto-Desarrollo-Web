// GET    /api/targets       — Listar targets del usuario (con filtros y paginado)
// POST   /api/targets       — Crear target
// GET    /api/targets/:id   — Detalle
// PATCH  /api/targets/:id   — Editar
// DELETE /api/targets/:id   — Borrar
const { targets, newId } = require('../data/store');
const { targetSchema, targetUpdateSchema } = require('../validators/target.validators');
const { log } = require('../services/activityLogger');

function ownOrAdmin(target, req, res) {
  if (target.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Sin permiso' });
    return false;
  }
  return true;
}

function listTargets(req, res) {
  const { q = '', tag = '', sort = 'alias', page = '1', limit = '10' } = req.query;
  let result = targets.filter((t) => t.userId === req.user.id);
  if (q)   result = result.filter((t) => t.alias.toLowerCase().includes(q.toLowerCase()) || t.host.toLowerCase().includes(q.toLowerCase()) || t.notes.toLowerCase().includes(q.toLowerCase()));
  if (tag) result = result.filter((t) => t.tags.includes(tag));
  if (sort === 'alias') result.sort((a, b) => a.alias.localeCompare(b.alias));
  else                  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total  = result.length;
  const pageN  = Math.max(1, parseInt(page));
  const limitN = Math.min(50, Math.max(1, parseInt(limit)));
  const items  = result.slice((pageN - 1) * limitN, pageN * limitN);
  res.json({ items, total, page: pageN, pages: Math.ceil(total / limitN) });
}

function createTarget(req, res, next) {
  try {
    const data   = targetSchema.parse(req.body);
    const target = { id: newId(), userId: req.user.id, ...data, createdAt: new Date() };
    targets.push(target);
    log({ userId: req.user.id, action: 'target.create', entity: 'targets', entityId: target.id, ip: req.ip });
    res.status(201).json(target);
  } catch (err) { next(err); }
}

function getTarget(req, res) {
  const target = targets.find((t) => t.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Target no encontrado' });
  if (!ownOrAdmin(target, req, res)) return;
  res.json(target);
}

function updateTarget(req, res, next) {
  try {
    const target = targets.find((t) => t.id === req.params.id);
    if (!target) return res.status(404).json({ error: 'Target no encontrado' });
    if (!ownOrAdmin(target, req, res)) return;

    const data = targetUpdateSchema.parse(req.body);
    Object.assign(target, data);
    log({ userId: req.user.id, action: 'target.update', entity: 'targets', entityId: target.id, ip: req.ip });
    res.json(target);
  } catch (err) { next(err); }
}

function deleteTarget(req, res, next) {
  try {
    const idx = targets.findIndex((t) => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Target no encontrado' });
    if (!ownOrAdmin(targets[idx], req, res)) return;
    const [removed] = targets.splice(idx, 1);
    log({ userId: req.user.id, action: 'target.delete', entity: 'targets', entityId: removed.id, ip: req.ip });
    res.json({ message: 'Target eliminado' });
  } catch (err) { next(err); }
}

module.exports = { listTargets, createTarget, getTarget, updateTarget, deleteTarget };
