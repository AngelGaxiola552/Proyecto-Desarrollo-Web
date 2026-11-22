const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { getStats } = require('../controllers/stats.controller');

const router = Router();

router.get('/', requireAuth, getStats);

module.exports = router;
