import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { User, AssassinProfile, Mission, Review } from '../models';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';

// Función auxiliar para calcular estadísticas de un asesino
const calculateAssassinStats = async (userId: string) => {
  const completedMissions = await Mission.findAll({
    where: { assassinId: userId, status: 'completed' },
  });

  const activeMissions = await Mission.findAll({
    where: { assassinId: userId, status: 'in_progress' },
  });

  const missionIds = completedMissions.map((m) => m.id);
  const reviews = missionIds.length > 0
    ? await Review.findAll({ where: { missionId: { [Op.in]: missionIds } } })
    : [];

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  // Calcular rating del último mes
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const recentMissions = completedMissions.filter((m) => m.updatedAt >= monthAgo);
  const recentMissionIds = recentMissions.map((m) => m.id);
  const recentReviews = recentMissionIds.length > 0
    ? await Review.findAll({ where: { missionId: { [Op.in]: recentMissionIds } } })
    : [];

  const avgRatingLastMonth =
    recentReviews.length > 0
      ? recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length
      : 0;

  const totalEarnings = completedMissions.reduce((sum, m) => sum + m.reward, 0);

  return {
    averageRatingAllTime: Math.round(avgRating * 10) / 10,
    averageRatingLastMonth: Math.round(avgRatingLastMonth * 10) / 10,
    completedContracts: completedMissions.length,
    totalEarnings,
    activeContracts: activeMissions.length,
  };
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      where: { suspended: false },
      attributes: ['id', 'email', 'name', 'nickname', 'role', 'coins', 'createdAt'],
    });

    return successResponse(res, { users });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener usuarios', 500);
  }
};

export const getAssassins = async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      where: { role: 'assassin', suspended: false },
      include: [{ model: AssassinProfile, as: 'assassinProfile' }],
    });

    const assassins = await Promise.all(
      users.map(async (u) => {
        const profile = (u as any).assassinProfile;
        const stats = await calculateAssassinStats(u.id);

        return {
          id: u.id,
          email: u.email,
          name: u.name,
          nickname: u.nickname,
          rating: stats.averageRatingAllTime,
          averageRatingAllTime: stats.averageRatingAllTime,
          averageRatingLastMonth: stats.averageRatingLastMonth,
          completedContracts: stats.completedContracts,
          totalEarnings: stats.totalEarnings,
          activeContracts: stats.activeContracts,
          status: stats.activeContracts > 0 ? 'busy' : (profile?.status || 'available'),
          location: profile?.location || null,
          specialties: profile?.specialties || [],
          minContractValue: profile?.minContractValue || 10000,
        };
      })
    );

    return successResponse(res, { assassins });
  } catch (error) {
    console.error('GetAssassins error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener asesinos', 500);
  }
};

// Obtener estadísticas de un asesino específico
export const getAssassinStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'assassin') {
      return notFoundResponse(res, 'Asesino');
    }

    const stats = await calculateAssassinStats(userId);

    return successResponse(res, { stats });
  } catch (error) {
    console.error('GetAssassinStats error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener estadísticas', 500);
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return notFoundResponse(res, 'Usuario');
    }

    if (!['admin', 'contractor', 'assassin'].includes(role)) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Rol inválido', 400);
    }

    await user.update({ role });

    return successResponse(res, {});
  } catch (error) {
    console.error('UpdateUserRole error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al actualizar rol', 500);
  }
};

export const suspendUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return notFoundResponse(res, 'Usuario');
    }

    await user.update({ suspended: true });

    return successResponse(res, {});
  } catch (error) {
    console.error('SuspendUser error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al suspender usuario', 500);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return notFoundResponse(res, 'Usuario');
    }

    await user.destroy();

    return successResponse(res, {});
  } catch (error) {
    console.error('DeleteUser error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al eliminar usuario', 500);
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'name', 'nickname', 'role', 'coins', 'suspended', 'createdAt'],
    });

    if (!user) {
      return notFoundResponse(res, 'Usuario');
    }

    return successResponse(res, { user: user.toSafeJSON() });
  } catch (error) {
    console.error('GetUserById error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener usuario', 500);
  }
};

export const unsuspendUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return notFoundResponse(res, 'Usuario');
    }

    await user.update({ suspended: false });

    return successResponse(res, {});
  } catch (error) {
    console.error('UnsuspendUser error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al reactivar usuario', 500);
  }
};

export const getUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, { attributes: ['suspended'] });
    if (!user) {
      return notFoundResponse(res, 'Usuario');
    }

    return successResponse(res, { suspended: user.suspended });
  } catch (error) {
    console.error('GetUserStatus error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener estado', 500);
  }
};
