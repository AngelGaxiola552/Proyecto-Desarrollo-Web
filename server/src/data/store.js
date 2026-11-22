// Almacén en memoria que actúa como base de datos mientras no se conecta Atlas.
// Cada colección es un array. Los IDs se generan con Date.now() + Math.random().
// Al conectar Mongoose, este archivo se elimina y los modelos toman su lugar.

const bcrypt = require('bcrypt');

function newId() {
  return String(Date.now()) + String(Math.floor(Math.random() * 10000));
}

// ── Usuarios iniciales (contraseñas pre-hasheadas al primer require) ───────
let _usersReady = false;
const users = [
  { id: '1', name: 'Ángel Gaxiola',    email: 'angel@netscope.mx',   passwordHash: null, role: 'admin', createdAt: new Date('2026-11-01') },
  { id: '2', name: 'Abraham Hernández', email: 'abraham@netscope.mx', passwordHash: null, role: 'user',  createdAt: new Date('2026-11-01') },
];

async function initUsers() {
  if (_usersReady) return;
  const hash = await bcrypt.hash('Demo1234', 10);
  users.forEach((u) => { u.passwordHash = hash; });
  _usersReady = true;
}

const targets  = [];
const profiles = [];
const scans    = [];
const activity = [];

module.exports = { users, targets, profiles, scans, activity, newId, initUsers };
