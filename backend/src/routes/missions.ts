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
  acceptMissionFromNotification,
  getAssassinMissions,
} from '../controllers/missionsController';
import { createNegotiation } from '../controllers/negotiationsController';
import { createReview } from '../controllers/reviewsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Ruta pública para ver misiones (sin autenticación)
router.get('/public', getMissions);
router.get('/', authenticate, getMissions);
router.get('/user', authenticate, getUserMissions);
router.get('/assigned', authenticate, getAssignedMissions);
router.get('/available', authenticate, requireAdmin, getAvailableMissions);
router.get('/assassin/:assassinId', authenticate, requireAdmin, getAssassinMissions);
router.get('/:missionId', authenticate, getMissionById);
router.post('/', authenticate, createMission);
router.put('/:missionId', authenticate, updateMission);
router.post('/:missionId/assign', authenticate, assignMission);
router.post('/:missionId/accept', authenticate, acceptMissionFromNotification);
router.post('/:missionId/complete', authenticate, completeMission);
router.delete('/:missionId', authenticate, deleteMission);

// Negociaciones y reseñas anidadas
router.post('/:missionId/negotiate', authenticate, createNegotiation);
router.post('/:missionId/review', authenticate, createReview);

export default router;
