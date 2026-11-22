const { Router } = require('express');
const { register, login, logout } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.post('/register', register);
router.post('/login',    login);
router.post('/logout',   requireAuth, logout);

module.exports = router;
