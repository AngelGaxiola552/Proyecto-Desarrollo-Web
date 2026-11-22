// GET    /api/profiles       — Listar perfiles del usuario
// POST   /api/profiles       — Crear perfil
// GET    /api/profiles/:id   — Detalle
// PATCH  /api/profiles/:id   — Editar
// DELETE /api/profiles/:id   — Borrar
const { profiles, newId } = require('../data/store');
const { profileSchema, profileUpdateSchema } = require('../validators/profile.validators');
const { log } = require('../services/activityLogger');

function ownOrAdmin(profile, req, res) {
  if (profile.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Sin permiso' });
    return false;
  }
  return true;
}

function listProfiles(req, res) {
  const { q = '', sort = 'name', page = '1', limit = '10' } = req.query;
  let result = profiles.filter((p) => p.userId === req.user.id);
  if (q) result = result.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  result.sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : new Date(b.createdAt) - new Date(a.createdAt));

  const total  = result.length;
  const pageN  = Math.max(1, parseInt(page));
  const limitN = Math.min(50, Math.max(1, parseInt(limit)));
  res.json({ items: result.slice((pageN - 1) * limitN, pageN * limitN), total, page: pageN, pages: Math.ceil(total / limitN) });
}

function createProfile(req, res, next) {
  try {
    const data    = profileSchema.parse(req.body);
    const profile = { id: newId(), userId: req.user.id, ...data, createdAt: new Date() };
    profiles.push(profile);
    log({ userId: req.user.id, action: 'profile.create', entity: 'profiles', entityId: profile.id, ip: req.ip });
    res.status(201).json(profile);
  } catch (err) { next(err); }
}

function getProfile(req, res) {
  const profile = profiles.find((p) => p.id === req.params.id);
  if (!profile) return res.status(404).json({ error: 'Perfil no encontrado' });
  if (!ownOrAdmin(profile, req, res)) return;
  res.json(profile);
}

function updateProfile(req, res, next) {
  try {
    const profile = profiles.find((p) => p.id === req.params.id);
    if (!profile) return res.status(404).json({ error: 'Perfil no encontrado' });
    if (!ownOrAdmin(profile, req, res)) return;
    const data = profileUpdateSchema.parse(req.body);
    Object.assign(profile, data);
    log({ userId: req.user.id, action: 'profile.update', entity: 'profiles', entityId: profile.id, ip: req.ip });
    res.json(profile);
  } catch (err) { next(err); }
}

function deleteProfile(req, res, next) {
  try {
    const idx = profiles.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Perfil no encontrado' });
    if (!ownOrAdmin(profiles[idx], req, res)) return;
    const [removed] = profiles.splice(idx, 1);
    log({ userId: req.user.id, action: 'profile.delete', entity: 'profiles', entityId: removed.id, ip: req.ip });
    res.json({ message: 'Perfil eliminado' });
  } catch (err) { next(err); }
}

module.exports = { listProfiles, createProfile, getProfile, updateProfile, deleteProfile };
