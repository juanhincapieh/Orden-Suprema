import { Router } from 'express';
import authRoutes from './auth';
import usersRoutes from './users';
import missionsRoutes from './missions';
import negotiationsRoutes from './negotiations';
import reviewsRoutes from './reviews';
import coinsRoutes from './coins';
import transactionsRoutes from './transactions';
import notificationsRoutes from './notifications';
import reportsRoutes from './reports';
import debtsRoutes from './debts';
import assassinsRoutes from './assassins';
import targetsRoutes from './targets';
import leaderboardRoutes from './leaderboard';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/missions', missionsRoutes);
router.use('/negotiations', negotiationsRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/coins', coinsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/reports', reportsRoutes);
router.use('/debts', debtsRoutes);
router.use('/assassin-profiles', assassinsRoutes);
router.use('/assassins', assassinsRoutes); // Alias para compatibilidad con frontend
router.use('/targets', targetsRoutes);
router.use('/leaderboard', leaderboardRoutes);

export default router;
