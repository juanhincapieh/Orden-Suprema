import { Router } from 'express';
import { createReport, getReports, resolveReport, cancelReport, updateReport, deleteReport } from '../controllers/reportsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createReport);
router.get('/', authenticate, requireAdmin, getReports);
router.put('/:reportId', authenticate, requireAdmin, updateReport);
router.put('/:reportId/resolve', authenticate, requireAdmin, resolveReport);
router.put('/:reportId/cancel', authenticate, requireAdmin, cancelReport);
router.delete('/:reportId', authenticate, requireAdmin, deleteReport);

export default router;
