// POST /api/scans/preview    — Devolver el comando que se ejecutaría
// POST /api/scans            — Crear y lanzar escaneo (202)
// GET  /api/scans            — Historial con filtros y paginado
// GET  /api/scans/:id        — Detalle y estado (polling)
// PATCH /api/scans/:id       — Editar nombre, notas, etiquetas
// POST /api/scans/:id/cancel — Cancelar escaneo en curso
// DELETE /api/scans/:id      — Borrar del historial
const { spawn } = require('child_process');
const { scans, targets, profiles, newId } = require('../data/store');
const { scanCreateSchema, scanUpdateSchema, previewSchema } = require('../validators/scan.validators');
const { buildArgs, buildPreview } = require('../services/buildCommand');
const { log } = require('../services/activityLogger');

const MAX_CONCURRENT = 2;      // máximo de escaneos simultáneos por usuario
const SCAN_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos

// Mapa de procesos activos: scanId → ChildProcess
const activeProcesses = new Map();

function ownOrAdmin(scan, req, res) {
  if (scan.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Sin permiso' });
    return false;
  }
  return true;
}

// ── Preview ────────────────────────────────────────────────────────────────
function preview(req, res, next) {
  try {
    const { host, options } = previewSchema.parse(req.body);
    res.json({ command: buildPreview(host, options) });
  } catch (err) { next(err); }
}

// ── Crear y lanzar ─────────────────────────────────────────────────────────
function createScan(req, res, next) {
  try {
    const data = scanCreateSchema.parse(req.body);

    // Regla: máximo MAX_CONCURRENT escaneos en curso por usuario
    const running = scans.filter((s) => s.userId === req.user.id && s.status === 'running');
    if (running.length >= MAX_CONCURRENT) {
      return res.status(429).json({ error: `No puedes tener más de ${MAX_CONCURRENT} escaneos en curso` });
    }

    // Resolver host: desde target o directo
    let host = data.hostSnapshot;
    if (data.targetId) {
      const target = targets.find((t) => t.id === data.targetId && t.userId === req.user.id);
      if (!target) return res.status(404).json({ error: 'Target no encontrado' });
      host = target.host;
    }
    if (!host) return res.status(400).json({ error: 'Se requiere targetId o hostSnapshot' });

    // Resolver opciones: desde perfil o directas
    let options = data.options || {};
    if (data.profileId) {
      const profile = profiles.find((p) => p.id === data.profileId && p.userId === req.user.id);
      if (!profile) return res.status(404).json({ error: 'Perfil no encontrado' });
      options = { ...profile.options, ...options };
    }

    const args    = buildArgs(host, options);
    const preview = buildPreview(host, options);

    const scan = {
      id:             newId(),
      userId:         req.user.id,
      name:           data.name || `Escaneo ${host}`,
      targetId:       data.targetId || null,
      hostSnapshot:   host,
      profileId:      data.profileId || null,
      options,
      commandPreview: preview,
      status:         'running',
      startedAt:      new Date(),
      finishedAt:     null,
      durationMs:     null,
      tags:           data.tags,
      notes:          data.notes,
      result:         null,
    };
    scans.unshift(scan);

    log({ userId: req.user.id, action: 'scan.start', entity: 'scans', entityId: scan.id, meta: { host, command: preview }, ip: req.ip });

    // Lanzar nmap en background (sin shell, sin input)
    let xmlOutput = '';
    let errorOutput = '';

    const proc = spawn('nmap', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    activeProcesses.set(scan.id, proc);

    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      scan.status    = 'failed';
      scan.finishedAt = new Date();
      scan.durationMs = Date.now() - scan.startedAt.getTime();
      activeProcesses.delete(scan.id);
      log({ userId: scan.userId, action: 'scan.timeout', entity: 'scans', entityId: scan.id, ip: '' });
    }, SCAN_TIMEOUT_MS);

    proc.stdout.on('data', (chunk) => { xmlOutput += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { errorOutput += chunk.toString(); });

    // Si nmap no se pudo ejecutar (por ejemplo, no está instalado), marcamos el escaneo
    // como fallido. Sin este manejador, Node lanza el error y el servidor completo se cae.
    proc.on('error', (err) => {
      clearTimeout(timer);
      activeProcesses.delete(scan.id);
      if (scan.status !== 'running') return;
      scan.status     = 'failed';
      scan.finishedAt = new Date();
      scan.durationMs = Date.now() - scan.startedAt.getTime();
      scan.result     = { error: err.code === 'ENOENT' ? 'Nmap no está instalado en el servidor' : err.message };
      log({ userId: scan.userId, action: 'scan.failed', entity: 'scans', entityId: scan.id, meta: { error: scan.result.error }, ip: '' });
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      activeProcesses.delete(scan.id);
      // Si ya se canceló, se marcó por tiempo excedido o falló al iniciar, no sobrescribimos su estado
      if (scan.status !== 'running') return;
      scan.finishedAt = new Date();
      scan.durationMs = Date.now() - scan.startedAt.getTime();

      if (code === 0 && xmlOutput) {
        try {
          // fast-xml-parser puede agregarse aquí; por ahora guardamos XML crudo
          scan.result = { raw: xmlOutput };
          scan.status = 'completed';
        } catch {
          scan.status = 'failed';
          scan.result = { error: 'Error al parsear XML' };
        }
      } else {
        scan.status = 'failed';
        scan.result = { error: errorOutput || 'Nmap terminó con error' };
      }

      log({ userId: scan.userId, action: `scan.${scan.status}`, entity: 'scans', entityId: scan.id, meta: { durationMs: scan.durationMs }, ip: '' });
    });

    // Respuesta 202 inmediata con el id para que el cliente haga polling
    res.status(202).json({ id: scan.id, status: scan.status, commandPreview: preview });
  } catch (err) { next(err); }
}

// ── Historial ──────────────────────────────────────────────────────────────
function listScans(req, res) {
  const { q = '', status = '', targetId = '', tag = '', from = '', to = '', sort = 'recent', page = '1', limit = '10' } = req.query;
  let result = scans.filter((s) => s.userId === req.user.id);

  if (q)        result = result.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.hostSnapshot.toLowerCase().includes(q.toLowerCase()) || s.notes.toLowerCase().includes(q.toLowerCase()));
  if (status)   result = result.filter((s) => s.status === status);
  if (targetId) result = result.filter((s) => s.targetId === targetId);
  if (tag)      result = result.filter((s) => s.tags.includes(tag));
  if (from)     result = result.filter((s) => new Date(s.startedAt) >= new Date(from));
  if (to)       result = result.filter((s) => new Date(s.startedAt) <= new Date(to));

  if (sort === 'oldest')   result.sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));
  else if (sort === 'duration') result.sort((a, b) => (b.durationMs || 0) - (a.durationMs || 0));
  else                      result.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

  const total  = result.length;
  const pageN  = Math.max(1, parseInt(page));
  const limitN = Math.min(50, Math.max(1, parseInt(limit)));
  res.json({ items: result.slice((pageN - 1) * limitN, pageN * limitN), total, page: pageN, pages: Math.ceil(total / limitN) });
}

// ── Detalle ────────────────────────────────────────────────────────────────
function getScan(req, res) {
  const scan = scans.find((s) => s.id === req.params.id);
  if (!scan) return res.status(404).json({ error: 'Escaneo no encontrado' });
  if (!ownOrAdmin(scan, req, res)) return;
  res.json(scan);
}

// ── Editar metadatos ───────────────────────────────────────────────────────
function updateScan(req, res, next) {
  try {
    const scan = scans.find((s) => s.id === req.params.id);
    if (!scan) return res.status(404).json({ error: 'Escaneo no encontrado' });
    if (!ownOrAdmin(scan, req, res)) return;

    const data = scanUpdateSchema.parse(req.body);
    if (data.name  !== undefined) scan.name  = data.name;
    if (data.notes !== undefined) scan.notes = data.notes;
    if (data.tags  !== undefined) scan.tags  = data.tags;

    log({ userId: req.user.id, action: 'scan.update', entity: 'scans', entityId: scan.id, ip: req.ip });
    res.json(scan);
  } catch (err) { next(err); }
}

// ── Cancelar ───────────────────────────────────────────────────────────────
function cancelScan(req, res) {
  const scan = scans.find((s) => s.id === req.params.id);
  if (!scan) return res.status(404).json({ error: 'Escaneo no encontrado' });
  if (!ownOrAdmin(scan, req, res)) return;

  if (scan.status !== 'running') {
    return res.status(400).json({ error: 'Solo se puede cancelar un escaneo en curso' });
  }

  const proc = activeProcesses.get(scan.id);
  if (proc) proc.kill('SIGTERM');
  activeProcesses.delete(scan.id);

  scan.status     = 'cancelled';
  scan.finishedAt = new Date();
  scan.durationMs = Date.now() - new Date(scan.startedAt).getTime();

  log({ userId: req.user.id, action: 'scan.cancel', entity: 'scans', entityId: scan.id, ip: req.ip });
  res.json({ message: 'Escaneo cancelado', scan });
}

// ── Borrar ─────────────────────────────────────────────────────────────────
function deleteScan(req, res, next) {
  try {
    const idx = scans.findIndex((s) => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Escaneo no encontrado' });
    if (!ownOrAdmin(scans[idx], req, res)) return;
    if (scans[idx].status === 'running') {
      return res.status(400).json({ error: 'No puedes borrar un escaneo en curso; cancélalo primero' });
    }
    const [removed] = scans.splice(idx, 1);
    log({ userId: req.user.id, action: 'scan.delete', entity: 'scans', entityId: removed.id, ip: req.ip });
    res.json({ message: 'Escaneo eliminado' });
  } catch (err) { next(err); }
}

module.exports = { preview, createScan, listScans, getScan, updateScan, cancelScan, deleteScan };
