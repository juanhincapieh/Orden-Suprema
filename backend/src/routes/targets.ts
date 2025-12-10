import { Router } from 'express';
import { getTargetStatus } from '../controllers/targetsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getTargetStatus);

export default router;
