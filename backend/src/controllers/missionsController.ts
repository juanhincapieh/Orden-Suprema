import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Mission, User, Negotiation, Review, Notification } from '../models';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../utils/response';

const getMissionWithDetails = async (mission: Mission) => {
  const contractor = await User.findByPk(mission.contractorId);
  const assassin = mission.assassinId ? await User.findByPk(mission.assassinId) : null;
  const negotiation = await Negotiation.findOne({
    where: { missionId: mission.id, status: 'pending' },
    include: [{ model: User, as: 'proposedByUser' }],
  });
  const review = await Review.findOne({ where: { missionId: mission.id } });

  return {
    ...mission.toJSON(),
    contractorName: contractor?.nickname || 'Desconocido',
    assassinName: assassin?.nickname || null,
    negotiation: negotiation
      ? {
          ...negotiation.toJSON(),
          proposedByEmail: (negotiation as any).proposedByUser?.email,
          proposedByName: (negotiation as any).proposedByUser?.nickname,
        }
      : null,
    review: review?.toJSON() || null,
  };
};

export const getMissions = async (req: Request, res: Response) => {
  try {
    const { status, search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    const where: any = { isPrivate: false };
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const order: any = [[sortBy as string, sortOrder as string]];
    if (sortBy === 'date') order[0][0] = 'createdAt';

    const missions = await Mission.findAll({ where, order });
    const missionsWithDetails = await Promise.all(missions.map(getMissionWithDetails));

    return successResponse(res, { missions: missionsWithDetails });
  } catch (error) {
    console.error('GetMissions error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener misiones', 500);
  }
};

export const getUserMissions = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const missions = await Mission.findAll({ where: { contractorId: userId } });
    const missionsWithDetails = await Promise.all(missions.map(getMissionWithDetails));

    return successResponse(res, { missions: missionsWithDetails });
  } catch (error) {
    console.error('GetUserMissions error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener misiones', 500);
  }
};

export const getAssignedMissions = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    const where: any = { assassinId: userId };
    if (status === 'active') where.status = 'in_progress';
    else if (status === 'completed') where.status = 'completed';

    const missions = await Mission.findAll({ where });
    const missionsWithDetails = await Promise.all(missions.map(getMissionWithDetails));

    return successResponse(res, { missions: missionsWithDetails });
  } catch (error) {
    console.error('GetAssignedMissions error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener misiones', 500);
  }
};

export const getAvailableMissions = async (_req: Request, res: Response) => {
  try {
    const missions = await Mission.findAll({
      where: {
        status: { [Op.in]: ['open', 'negotiating'] },
        assassinId: { [Op.eq]: null as any },
      },
    });
    const missionsWithDetails = await Promise.all(missions.map(getMissionWithDetails));

    return successResponse(res, { missions: missionsWithDetails });
  } catch (error) {
    console.error('GetAvailableMissions error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener misiones', 500);
  }
};

export const getMissionById = async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const mission = await Mission.findByPk(missionId);

    if (!mission) {
      return notFoundResponse(res, 'Misión');
    }

    const missionWithDetails = await getMissionWithDetails(mission);
    return successResponse(res, { mission: missionWithDetails });
  } catch (error) {
    console.error('GetMissionById error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener misión', 500);
  }
};

export const createMission = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, description, reward, location, deadline, isPrivate, targetAssassinId } = req.body;

    if (!title || !description || !reward) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Título, descripción y recompensa son requeridos', 400);
    }

    const user = await User.findByPk(userId);
    if (!user || user.coins < reward) {
      return errorResponse(res, 'INSUFFICIENT_FUNDS', 'No tienes suficientes monedas', 400);
    }

    await user.update({ coins: user.coins - reward });

    const newMission = await Mission.create({
      title,
      description,
      reward,
      contractorId: userId,
      isPrivate: isPrivate || false,
      targetAssassinId,
      location,
      deadline,
    });

    const missionWithDetails = await getMissionWithDetails(newMission);
    return successResponse(res, { mission: missionWithDetails, newBalance: user.coins - reward }, 201);
  } catch (error) {
    console.error('CreateMission error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al crear misión', 500);
  }
};

export const updateMission = async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const userId = req.user!.userId;
    const updates = req.body;

    const mission = await Mission.findByPk(missionId);
    if (!mission) {
      return notFoundResponse(res, 'Misión');
    }

    if (mission.contractorId !== userId && req.user!.role !== 'admin') {
      return forbiddenResponse(res, 'No puedes editar esta misión');
    }

    await mission.update(updates);

    const missionWithDetails = await getMissionWithDetails(mission);
    return successResponse(res, { mission: missionWithDetails });
  } catch (error) {
    console.error('UpdateMission error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al actualizar misión', 500);
  }
};

export const assignMission = async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const { assassinId, sendNotificationOnly } = req.body;

    const mission = await Mission.findByPk(missionId);
    if (!mission) {
      return notFoundResponse(res, 'Misión');
    }

    const assassin = await User.findByPk(assassinId);
    if (!assassin || assassin.role !== 'assassin') {
      return errorResponse(res, 'INVALID_ASSASSIN', 'Asesino no válido', 400);
    }

    const sender = await User.findByPk(req.user!.userId);

    // Si sendNotificationOnly es true, solo enviar notificación (asesino ocupado)
    if (sendNotificationOnly) {
      await Notification.create({
        userId: assassinId,
        type: 'mission_assignment',
        senderId: req.user!.userId,
        senderName: sender?.nickname || sender?.email || 'Admin',
        missionId: mission.id,
        missionTitle: mission.title,
        missionReward: mission.reward,
        status: 'pending',
      });

      return successResponse(res, { 
        notificationSent: true,
        message: 'Notificación de asignación enviada al asesino'
      });
    }

    // Asignar directamente
    await mission.update({ assassinId, status: 'in_progress' });

    await Notification.create({
      userId: assassinId,
      type: 'mission_assignment',
      senderId: req.user!.userId,
      senderName: sender?.nickname || sender?.email || 'Admin',
      missionId: mission.id,
      missionTitle: mission.title,
      missionReward: mission.reward,
      status: 'accepted',
      message: `Se te ha asignado la misión: ${mission.title}`,
    });

    const missionWithDetails = await getMissionWithDetails(mission);
    return successResponse(res, { mission: missionWithDetails });
  } catch (error) {
    console.error('AssignMission error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al asignar misión', 500);
  }
};

export const completeMission = async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const userId = req.user!.userId;

    const mission = await Mission.findByPk(missionId);
    if (!mission) {
      return notFoundResponse(res, 'Misión');
    }

    if (mission.assassinId !== userId) {
      return forbiddenResponse(res, 'No puedes completar esta misión');
    }

    await mission.update({ status: 'completed', terminado: true });

    const assassin = await User.findByPk(userId);
    if (assassin) {
      await assassin.update({ coins: assassin.coins + mission.reward });
    }

    const missionWithDetails = await getMissionWithDetails(mission);
    return successResponse(res, {
      mission: missionWithDetails,
      reward: mission.reward,
      newBalance: assassin?.coins || 0,
    });
  } catch (error) {
    console.error('CompleteMission error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al completar misión', 500);
  }
};

export const deleteMission = async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const userId = req.user!.userId;

    const mission = await Mission.findByPk(missionId);
    if (!mission) {
      return notFoundResponse(res, 'Misión');
    }

    if (mission.contractorId !== userId && req.user!.role !== 'admin') {
      return forbiddenResponse(res, 'No puedes eliminar esta misión');
    }

    if (mission.status !== 'completed') {
      const contractor = await User.findByPk(mission.contractorId);
      if (contractor) {
        await contractor.update({ coins: contractor.coins + mission.reward });
      }
    }

    await mission.destroy();

    return successResponse(res, {});
  } catch (error) {
    console.error('DeleteMission error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al eliminar misión', 500);
  }
};

// Obtener misiones de un asesino específico (para admin)
export const getAssassinMissions = async (req: Request, res: Response) => {
  try {
    const { assassinId } = req.params;

    const missions = await Mission.findAll({
      where: { assassinId },
      order: [['updatedAt', 'DESC']],
    });

    const missionsWithDetails = await Promise.all(missions.map(getMissionWithDetails));

    return successResponse(res, { missions: missionsWithDetails });
  } catch (error) {
    console.error('GetAssassinMissions error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener misiones del asesino', 500);
  }
};

// Aceptar misión desde notificación
export const acceptMissionFromNotification = async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const userId = req.user!.userId;

    const mission = await Mission.findByPk(missionId);
    if (!mission) {
      return notFoundResponse(res, 'Misión');
    }

    // Verificar si la misión ya fue asignada a otro
    if (mission.assassinId && mission.status === 'in_progress') {
      return errorResponse(
        res,
        'MISSION_ALREADY_ASSIGNED',
        'Lo sentimos, esta misión ya ha sido asignada a otro asesino',
        409
      );
    }

    // Verificar que el usuario es un asesino
    const user = await User.findByPk(userId);
    if (!user || user.role !== 'assassin') {
      return forbiddenResponse(res, 'Solo los asesinos pueden aceptar misiones');
    }

    // Asignar la misión
    await mission.update({
      assassinId: userId,
      status: 'in_progress',
    });

    const missionWithDetails = await getMissionWithDetails(mission);
    return successResponse(res, { mission: missionWithDetails });
  } catch (error) {
    console.error('AcceptMissionFromNotification error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al aceptar misión', 500);
  }
};
