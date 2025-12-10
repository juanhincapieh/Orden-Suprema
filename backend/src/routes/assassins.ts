import { Router } from 'express';
import { getAssassinProfiles, getAssassinProfile, updateAssassinProfile } from '../controllers/assassinsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAssassinProfiles);
router.get('/:email', authenticate, getAssassinProfile);
router.put('/:email', authenticate, updateAssassinProfile);

export default router;
