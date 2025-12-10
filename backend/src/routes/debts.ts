import { Router } from 'express';
import {
  createFavorRequest,
  getDebts,
  acceptDebt,
  rejectDebt,
  requestPayment,
  acceptPayment,
  rejectPayment,
  markCompleted,
  confirmCompletion,
  rejectCompletion,
} from '../controllers/debtsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/favor-request', authenticate, createFavorRequest);
router.get('/', authenticate, getDebts);
router.put('/:debtId/accept', authenticate, acceptDebt);
router.put('/:debtId/reject', authenticate, rejectDebt);
router.post('/:debtId/request-payment', authenticate, requestPayment);
router.put('/:debtId/accept-payment', authenticate, acceptPayment);
router.put('/:debtId/reject-payment', authenticate, rejectPayment);
router.post('/:debtId/mark-completed', authenticate, markCompleted);
router.put('/:debtId/confirm-completion', authenticate, confirmCompletion);
router.put('/:debtId/reject-completion', authenticate, rejectCompletion);

export default router;
