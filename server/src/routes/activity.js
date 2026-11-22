const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { listActivity } = require('../controllers/activity.controller');

const router = Router();

router.get('/', requireAuth, listActivity);

module.exports = router;
