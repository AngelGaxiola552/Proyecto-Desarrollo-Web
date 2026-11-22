const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { listProfiles, createProfile, getProfile, updateProfile, deleteProfile } = require('../controllers/profiles.controller');

const router = Router();

router.get('/',     requireAuth, listProfiles);
router.post('/',    requireAuth, createProfile);
router.get('/:id',  requireAuth, getProfile);
router.patch('/:id',requireAuth, updateProfile);
router.delete('/:id',requireAuth, deleteProfile);

module.exports = router;
