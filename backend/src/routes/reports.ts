import { Router } from 'express';
import { createReport, getReports, resolveReport, cancelReport } from '../controllers/reportsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createReport);
router.get('/', authenticate, requireAdmin, getReports);
router.put('/:reportId/resolve', authenticate, requireAdmin, resolveReport);
router.put('/:reportId/cancel', authenticate, requireAdmin, cancelReport);

export default router;
