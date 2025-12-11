import { Router } from 'express';
import {
  getAssassinProfiles,
  getAssassinProfile,
  updateAssassinProfile,
  updateAssassinLocation,
  getAssassinLocation,
} from '../controllers/assassinsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAssassinProfiles);
router.get('/location', authenticate, getAssassinLocation);
router.put('/location', authenticate, updateAssassinLocation);
router.get('/:email', authenticate, getAssassinProfile);
router.put('/:email', authenticate, updateAssassinProfile);

export default router;
