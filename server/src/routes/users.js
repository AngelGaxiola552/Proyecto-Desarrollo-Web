const { Router } = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getMe, updateMe, deleteMe, listUsers, createUser, updateUser, deleteUser } = require('../controllers/users.controller');

const router = Router();

// Perfil propio
router.get('/me',    requireAuth, getMe);
router.patch('/me',  requireAuth, updateMe);
router.delete('/me', requireAuth, deleteMe);

// Admin
router.get('/',      requireAuth, requireAdmin, listUsers);
router.post('/',     requireAuth, requireAdmin, createUser);
router.patch('/:id', requireAuth, requireAdmin, updateUser);
router.delete('/:id',requireAuth, requireAdmin, deleteUser);

module.exports = router;
