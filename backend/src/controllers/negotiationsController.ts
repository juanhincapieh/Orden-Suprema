import { Request, Response } from 'express';
import { Mission, User, Negotiation, Notification } from '../models';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../utils/response';

export const createNegotiation = async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const userId = req.user!.userId;
    const { proposedReward, message } = req.body;

    const mission = await Mission.findByPk(missionId);
    if (!mission) {
      return notFoundResponse(res, 'Misión');
    }

    const existingNegotiation = await Negotiation.findOne({
      where: { missionId, status: 'pending' },
    });
    if (existingNegotiation) {
      return errorResponse(res, 'NEGOTIATION_EXISTS', 'Ya existe una negociación pendiente', 409);
    }

    const user = await User.findByPk(userId);
    const proposedBy = user?.role === 'contractor' ? 'contractor' : 'assassin';

    const negotiation = await Negotiation.create({
      missionId,
      proposedBy,
      proposedById: userId,
      proposedReward,
      message: message || '',
    });

    await mission.update({ status: 'negotiating' });

    const recipientId = proposedBy === 'contractor' ? mission.assassinId : mission.contractorId;
    if (recipientId) {
      await Notification.create({
        userId: recipientId,
        type: 'negotiation',
        senderId: userId,
        missionId,
        message: `Nueva propuesta de negociación: ${proposedReward} monedas`,
      });
    }

    return successResponse(
      res,
      {
        negotiation: {
          ...negotiation.toJSON(),
          proposedByEmail: user?.email,
          proposedByName: user?.nickname,
        },
      },
      201
    );
  } catch (error) {
    console.error('CreateNegotiation error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al crear negociación', 500);
  }
};

export const acceptNegotiation = async (req: Request, res: Response) => {
  try {
    const { negotiationId } = req.params;
    const userId = req.user!.userId;

    const negotiation = await Negotiation.findByPk(negotiationId);
    if (!negotiation) {
      return notFoundResponse(res, 'Negociación');
    }

    if (negotiation.status !== 'pending') {
      return errorResponse(res, 'INVALID_STATUS', 'La negociación ya fue procesada', 400);
    }

    const mission = await Mission.findByPk(negotiation.missionId);
    if (!mission) {
      return notFoundResponse(res, 'Misión');
    }

    if (negotiation.proposedById === userId) {
      return forbiddenResponse(res, 'No puedes aceptar tu propia propuesta');
    }

    const contractor = await User.findByPk(mission.contractorId);
    if (contractor) {
      const difference = negotiation.proposedReward - mission.reward;
      if (difference > 0 && contractor.coins < difference) {
        return errorResponse(res, 'INSUFFICIENT_FUNDS', 'El contratista no tiene suficientes monedas', 400);
      }
      await contractor.update({ coins: contractor.coins - difference });
    }

    await negotiation.update({ status: 'accepted', respondedAt: new Date() });
    await mission.update({ reward: negotiation.proposedReward, status: 'in_progress' });

    if (negotiation.proposedBy === 'assassin') {
      await mission.update({ assassinId: negotiation.proposedById });
    }

    const assassin = mission.assassinId ? await User.findByPk(mission.assassinId) : null;

    return successResponse(res, {
      mission: {
        ...mission.toJSON(),
        contractorName: contractor?.nickname,
        assassinName: assassin?.nickname || null,
      },
    });
  } catch (error) {
    console.error('AcceptNegotiation error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al aceptar negociación', 500);
  }
};

export const rejectNegotiation = async (req: Request, res: Response) => {
  try {
    const { negotiationId } = req.params;
    const userId = req.user!.userId;

    const negotiation = await Negotiation.findByPk(negotiationId);
    if (!negotiation) {
      return notFoundResponse(res, 'Negociación');
    }

    if (negotiation.status !== 'pending') {
      return errorResponse(res, 'INVALID_STATUS', 'La negociación ya fue procesada', 400);
    }

    if (negotiation.proposedById === userId) {
      return forbiddenResponse(res, 'No puedes rechazar tu propia propuesta');
    }

    const mission = await Mission.findByPk(negotiation.missionId);
    if (mission) {
      await mission.update({ status: 'open' });
    }

    await negotiation.update({ status: 'rejected', respondedAt: new Date() });

    return successResponse(res, {});
  } catch (error) {
    console.error('RejectNegotiation error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al rechazar negociación', 500);
  }
};
