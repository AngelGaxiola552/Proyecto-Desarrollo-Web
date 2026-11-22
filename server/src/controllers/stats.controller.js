// GET /api/stats — Conteos para el dashboard del usuario actual
const { scans, targets, profiles } = require('../data/store');

function getStats(req, res) {
  const uid = req.user.id;
  const userScans = scans.filter((s) => s.userId === uid);

  res.json({
    totalScans:     userScans.length,
    runningScans:   userScans.filter((s) => s.status === 'running').length,
    completedScans: userScans.filter((s) => s.status === 'completed').length,
    failedScans:    userScans.filter((s) => s.status === 'failed').length,
    totalTargets:   targets.filter((t) => t.userId === uid).length,
    totalProfiles:  profiles.filter((p) => p.userId === uid).length,
  });
}

module.exports = { getStats };
