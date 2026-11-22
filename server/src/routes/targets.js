const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { listTargets, createTarget, getTarget, updateTarget, deleteTarget } = require('../controllers/targets.controller');

const router = Router();

router.get('/',     requireAuth, listTargets);
router.post('/',    requireAuth, createTarget);
router.get('/:id',  requireAuth, getTarget);
router.patch('/:id',requireAuth, updateTarget);
router.delete('/:id',requireAuth, deleteTarget);

module.exports = router;
