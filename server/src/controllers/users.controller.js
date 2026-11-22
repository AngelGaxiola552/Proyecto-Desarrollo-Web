// GET    /api/users/me      — Ver perfil propio
// PATCH  /api/users/me      — Actualizar perfil propio
// DELETE /api/users/me      — Eliminar cuenta propia (pide contraseña)
// GET    /api/users         — Listar usuarios (admin)
// POST   /api/users         — Crear usuario (admin)
// PATCH  /api/users/:id     — Editar usuario o rol (admin)
// DELETE /api/users/:id     — Dar de baja usuario (admin)
const bcrypt = require('bcrypt');
const { users, targets, profiles, scans, activity, newId } = require('../data/store');
const { updateMeSchema, deleteMeSchema, adminCreateSchema, adminUpdateSchema } = require('../validators/user.validators');
const { log } = require('../services/activityLogger');

function safeUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

// ── Perfil propio ──────────────────────────────────────────────────────────
function getMe(req, res) {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(safeUser(user));
}

async function updateMe(req, res, next) {
  try {
    const data = updateMeSchema.parse(req.body);
    const user = users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (data.email && data.email !== user.email && users.find((u) => u.email === data.email)) {
      return res.status(409).json({ error: 'El correo ya está en uso' });
    }

    if (data.name)     user.name  = data.name;
    if (data.email)    user.email = data.email;
    if (data.password) user.passwordHash = await bcrypt.hash(data.password, 10);

    log({ userId: user.id, action: 'user.update', entity: 'users', entityId: user.id, ip: req.ip });
    res.json(safeUser(user));
  } catch (err) { next(err); }
}

async function deleteMe(req, res, next) {
  try {
    const { password } = deleteMeSchema.parse(req.body);
    const idx = users.findIndex((u) => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'Usuario no encontrado' });

    const user = users[idx];
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Borrar recursos del usuario
    [targets, profiles, scans].forEach((col) => {
      const toRemove = col.filter((r) => r.userId === user.id).map((r) => r.id);
      toRemove.forEach((id) => { const i = col.findIndex((r) => r.id === id); if (i !== -1) col.splice(i, 1); });
    });

    log({ userId: user.id, action: 'user.deleted', entity: 'users', entityId: user.id, ip: req.ip });
    users.splice(idx, 1);
    res.clearCookie('token');
    res.json({ message: 'Cuenta eliminada' });
  } catch (err) { next(err); }
}

// ── Admin: CRUD de usuarios ────────────────────────────────────────────────
function listUsers(req, res) {
  const { q = '', role = '', page = '1', limit = '10' } = req.query;
  let result = users;
  if (q)    result = result.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));
  if (role) result = result.filter((u) => u.role === role);

  const total = result.length;
  const pageN = Math.max(1, parseInt(page));
  const limitN = Math.min(50, Math.max(1, parseInt(limit)));
  const items = result.slice((pageN - 1) * limitN, pageN * limitN).map(safeUser);

  res.json({ items, total, page: pageN, pages: Math.ceil(total / limitN) });
}

async function createUser(req, res, next) {
  try {
    const data = adminCreateSchema.parse(req.body);
    if (users.find((u) => u.email === data.email)) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = { id: newId(), name: data.name, email: data.email, passwordHash, role: data.role, createdAt: new Date() };
    users.push(user);
    log({ userId: req.user.id, action: 'admin.user.create', entity: 'users', entityId: user.id, ip: req.ip });
    res.status(201).json(safeUser(user));
  } catch (err) { next(err); }
}

async function updateUser(req, res, next) {
  try {
    const data = adminUpdateSchema.parse(req.body);
    const user = users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (data.email && data.email !== user.email && users.find((u) => u.email === data.email)) {
      return res.status(409).json({ error: 'El correo ya está en uso' });
    }

    if (data.name)     user.name     = data.name;
    if (data.email)    user.email    = data.email;
    if (data.role)     user.role     = data.role;
    if (data.password) user.passwordHash = await bcrypt.hash(data.password, 10);

    log({ userId: req.user.id, action: 'admin.user.update', entity: 'users', entityId: user.id, ip: req.ip });
    res.json(safeUser(user));
  } catch (err) { next(err); }
}

function deleteUser(req, res, next) {
  try {
    const idx = users.findIndex((u) => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (users[idx].id === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }
    const [removed] = users.splice(idx, 1);
    log({ userId: req.user.id, action: 'admin.user.delete', entity: 'users', entityId: removed.id, ip: req.ip });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) { next(err); }
}

module.exports = { getMe, updateMe, deleteMe, listUsers, createUser, updateUser, deleteUser };
