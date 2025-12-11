import { Router } from 'express';
import {
  getAllUsers,
  getAssassins,
  getUserById,
  updateUserRole,
  suspendUser,
  unsuspendUser,
  deleteUser,
  getUserStatus,
  getAssassinStats,
} from '../controllers/usersController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireAdmin, getAllUsers);
router.get('/assassins', authenticate, getAssassins);
router.get('/:userId', authenticate, getUserById);
router.get('/:userId/status', authenticate, getUserStatus);
router.get('/:userId/stats', authenticate, getAssassinStats);
router.put('/:userId/role', authenticate, requireAdmin, updateUserRole);
router.put('/:userId/suspend', authenticate, requireAdmin, suspendUser);
router.put('/:userId/unsuspend', authenticate, requireAdmin, unsuspendUser);
router.delete('/:userId', authenticate, requireAdmin, deleteUser);

export default router;
