// Configuración central de Express: middlewares globales y montaje de rutas.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes     = require('./routes/auth');
const userRoutes     = require('./routes/users');
const targetRoutes   = require('./routes/targets');
const profileRoutes  = require('./routes/profiles');
const scanRoutes     = require('./routes/scans');
const activityRoutes = require('./routes/activity');
const statsRoutes    = require('./routes/stats');

const app = express();

// ── Seguridad ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,   // necesario para enviar/recibir cookies
}));

// Límite global: 200 peticiones por IP cada 15 minutos
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Parsers ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Rutas ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/targets',  targetRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/scans',    scanRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/stats',    statsRoutes);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Manejador de errores global ────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
});

module.exports = app;
