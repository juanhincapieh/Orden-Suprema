import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createMissionAssignment,
  getPendingMissionAssignments,
  updateMissionAssignmentStatus,
} from '../controllers/notificationsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.get('/mission-assignments/pending', authenticate, getPendingMissionAssignments);
router.post('/mission-assignment', authenticate, createMissionAssignment);
router.put('/:notificationId/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.put('/mission-assignment/:notificationId/status', authenticate, updateMissionAssignmentStatus);
router.delete('/:notificationId', authenticate, deleteNotification);

export default router;
