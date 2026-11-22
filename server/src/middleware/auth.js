// Middleware de autenticación JWT.
// Lee el token desde la cookie httpOnly "token" o desde el header Authorization.
// Adjunta req.user = { id, role } si el token es válido.
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Se requiere rol admin' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
