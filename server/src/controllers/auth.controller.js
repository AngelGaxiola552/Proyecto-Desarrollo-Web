// POST /api/auth/register  — Crear cuenta
// POST /api/auth/login     — Iniciar sesión (emite cookie JWT httpOnly)
// POST /api/auth/logout    — Cerrar sesión (borra la cookie)
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const { users, newId, initUsers } = require('../data/store');
const { registerSchema, loginSchema } = require('../validators/auth.validators');
const { log } = require('../services/activityLogger');

function issueToken(user, res) {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
  });
  return token;
}

async function register(req, res, next) {
  try {
    await initUsers();
    const data = registerSchema.parse(req.body);

    if (users.find((u) => u.email === data.email)) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = { id: newId(), name: data.name, email: data.email, passwordHash, role: 'user', createdAt: new Date() };
    users.push(user);

    log({ userId: user.id, action: 'user.register', entity: 'users', entityId: user.id, ip: req.ip });

    issueToken(user, res);
    return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    await initUsers();
    const data = loginSchema.parse(req.body);
    const user = users.find((u) => u.email === data.email);

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    log({ userId: user.id, action: 'user.login', entity: 'users', entityId: user.id, ip: req.ip });

    issueToken(user, res);
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  log({ userId: req.user.id, action: 'user.logout', entity: 'users', entityId: req.user.id, ip: req.ip });
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada' });
}

module.exports = { register, login, logout };
