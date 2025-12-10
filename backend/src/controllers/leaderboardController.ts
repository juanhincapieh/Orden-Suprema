import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { User, Mission, Review } from '../models';
import { successResponse, errorResponse } from '../utils/response';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { period = 'all_time', limit = '10' } = req.query;
    const limitNum = parseInt(limit as string, 10);

    const assassins = await User.findAll({
      where: { role: 'assassin', suspended: false },
    });

    const leaderboard = await Promise.all(
      assassins.map(async (user) => {
        const where: any = { assassinId: user.id, status: 'completed' };

        if (period === 'monthly') {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          where.updatedAt = { [Op.gte]: monthAgo };
        } else if (period === 'weekly') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          where.updatedAt = { [Op.gte]: weekAgo };
        }

        const completedMissions = await Mission.findAll({ where });
        const missionIds = completedMissions.map((m) => m.id);

        const reviews = missionIds.length > 0
          ? await Review.findAll({ where: { missionId: { [Op.in]: missionIds } } })
          : [];

        const avgRating =
          reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

        const totalEarnings = completedMissions.reduce((sum, m) => sum + m.reward, 0);

        return {
          assassinId: user.id,
          nickname: user.nickname,
          rating: Math.round(avgRating * 10) / 10,
          completedMissions: completedMissions.length,
          totalEarnings,
        };
      })
    );

    leaderboard.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.completedMissions - a.completedMissions;
    });

    const ranked = leaderboard.slice(0, limitNum).map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    return successResponse(res, { leaderboard: ranked });
  } catch (error) {
    console.error('GetLeaderboard error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener leaderboard', 500);
  }
};
