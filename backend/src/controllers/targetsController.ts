import { Request, Response } from 'express';
import { Target } from '../models';
import { successResponse, errorResponse } from '../utils/response';

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
