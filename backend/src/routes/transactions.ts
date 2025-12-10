import { Router } from 'express';
import { getTransactions } from '../controllers/transactionsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getTransactions);

export default router;
