import { Router } from 'express';
import {
  getMissions,
  getUserMissions,
  getAssignedMissions,
  getAvailableMissions,
  getMissionById,
  createMission,
  updateMission,
  assignMission,
  completeMission,
  deleteMission,
} from '../controllers/missionsController';
import { createNegotiation } from '../controllers/negotiationsController';
import { createReview } from '../controllers/reviewsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getMissions);
router.get('/user', authenticate, getUserMissions);
router.get('/assigned', authenticate, getAssignedMissions);
router.get('/available', authenticate, requireAdmin, getAvailableMissions);
router.get('/:missionId', authenticate, getMissionById);
router.post('/', authenticate, createMission);
router.put('/:missionId', authenticate, updateMission);
router.post('/:missionId/assign', authenticate, assignMission);
router.post('/:missionId/complete', authenticate, completeMission);
router.delete('/:missionId', authenticate, deleteMission);

// Negociaciones y reseñas anidadas
router.post('/:missionId/negotiate', authenticate, createNegotiation);
router.post('/:missionId/review', authenticate, createReview);

export default router;
