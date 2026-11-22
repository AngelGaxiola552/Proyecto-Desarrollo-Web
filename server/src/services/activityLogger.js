// Registra un evento en la bitácora de actividad (store en memoria por ahora).
const { activity, newId } = require('../data/store');

function log({ userId, action, entity, entityId = null, meta = {}, ip = '' }) {
  activity.unshift({
    id:        newId(),
    userId,
    action,
    entity,
    entityId,
    meta,
    ip,
    timestamp: new Date(),
  });
}

module.exports = { log };
