import { Router } from 'express';
import { getTargetStatus, checkUserIsTarget, getAllTargets } from '../controllers/targetsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getTargetStatus);
router.get('/all', authenticate, requireAdmin, getAllTargets);
router.get('/:userId', authenticate, checkUserIsTarget);

export default router;
