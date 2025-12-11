import { Request, Response } from 'express';
import { Target } from '../models';
import { successResponse, errorResponse } from '../utils/response';

// Obtener estado de objetivo del usuario actual
export const getTargetStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const target = await Target.findOne({ where: { targetUserId: userId } });

    if (target) {
      return successResponse(res, {
        isTarget: true,
        targetInfo: {
          assassinId: target.id,
          debtId: target.debtId,
          markedAt: target.markedAt,
          reason: target.reason,
        },
      });
    }

    return successResponse(res, { isTarget: false, targetInfo: null });
  } catch (error) {
    console.error('GetTargetStatus error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener estado', 500);
  }
};

// Verificar si un usuario específico es objetivo
export const checkUserIsTarget = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const target = await Target.findOne({ where: { targetUserId: userId } });

    if (target) {
      return successResponse(res, {
        isTarget: true,
        targetInfo: {
          assassinId: target.id,
          debtId: target.debtId,
          markedAt: target.markedAt,
          reason: target.reason,
        },
      });
    }

    return successResponse(res, { isTarget: false, targetInfo: null });
  } catch (error) {
    console.error('CheckUserIsTarget error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al verificar objetivo', 500);
  }
};

// Obtener todos los objetivos (admin)
export const getAllTargets = async (_req: Request, res: Response) => {
  try {
    const targets = await Target.findAll();

    return successResponse(res, { targets: targets.map((t) => t.toJSON()) });
  } catch (error) {
    console.error('GetAllTargets error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener objetivos', 500);
  }
};
