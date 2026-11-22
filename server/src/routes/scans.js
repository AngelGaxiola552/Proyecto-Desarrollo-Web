const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { preview, createScan, listScans, getScan, updateScan, cancelScan, deleteScan } = require('../controllers/scans.controller');

const router = Router();

router.post('/preview',       requireAuth, preview);
router.post('/',              requireAuth, createScan);
router.get('/',               requireAuth, listScans);
router.get('/:id',            requireAuth, getScan);
router.patch('/:id',          requireAuth, updateScan);
router.post('/:id/cancel',    requireAuth, cancelScan);
router.delete('/:id',         requireAuth, deleteScan);

module.exports = router;
