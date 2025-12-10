import { Router } from 'express';
import { acceptNegotiation, rejectNegotiation } from '../controllers/negotiationsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.put('/:negotiationId/accept', authenticate, acceptNegotiation);
router.put('/:negotiationId/reject', authenticate, rejectNegotiation);

export default router;
