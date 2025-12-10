import { Router } from 'express';
import { getBalance, purchaseCoins, transferCoins } from '../controllers/coinsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/balance', authenticate, getBalance);
router.post('/purchase', authenticate, purchaseCoins);
router.post('/transfer', authenticate, transferCoins);

export default router;
