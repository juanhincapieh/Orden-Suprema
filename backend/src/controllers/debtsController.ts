import { Request, Response } from 'express';
import { Debt, User, Notification, Target } from '../models';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../utils/response';

export const createFavorRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { creditorEmail, description } = req.body;

    if (!creditorEmail || !description) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Email del acreedor y descripción son requeridos', 400);
    }

    const creditor = await User.findOne({ where: { email: creditorEmail } });
    if (!creditor) {
      return notFoundResponse(res, 'Acreedor');
    }

    if (creditor.id === userId) {
      return errorResponse(res, 'INVALID_REQUEST', 'No puedes pedirte un favor a ti mismo', 400);
    }

    const debt = await Debt.create({
      debtorId: userId,
      creditorId: creditor.id,
      favorDescription: description,
    });

    await Notification.create({
      userId: creditor.id,
      type: 'debt_request',
      senderId: userId,
      debtId: debt.id,
      message: `Solicitud de favor: ${description}`,
    });

    return successResponse(res, { debt: debt.toJSON() }, 201);
  } catch (error) {
    console.error('CreateFavorRequest error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al crear solicitud', 500);
  }
};

export const getDebts = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const debtsIOwe = await Debt.findAll({ where: { debtorId: userId } });
    const debtsOwedToMe = await Debt.findAll({ where: { creditorId: userId } });

    return successResponse(res, {
      debtsIOwe: debtsIOwe.map((d) => d.toJSON()),
      debtsOwedToMe: debtsOwedToMe.map((d) => d.toJSON()),
    });
  } catch (error) {
    console.error('GetDebts error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener deudas', 500);
  }
};

export const acceptDebt = async (req: Request, res: Response) => {
  try {
    const { debtId } = req.params;
    const userId = req.user!.userId;

    const debt = await Debt.findByPk(debtId);
    if (!debt) {
      return notFoundResponse(res, 'Deuda');
    }

    if (debt.creditorId !== userId) {
      return forbiddenResponse(res, 'Solo el acreedor puede aceptar');
    }

    await debt.update({ status: 'active' });

    return successResponse(res, { debt: debt.toJSON() });
  } catch (error) {
    console.error('AcceptDebt error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al aceptar deuda', 500);
  }
};

export const rejectDebt = async (req: Request, res: Response) => {
  try {
    const { debtId } = req.params;
    const userId = req.user!.userId;

    const debt = await Debt.findByPk(debtId);
    if (!debt) {
      return notFoundResponse(res, 'Deuda');
    }

    if (debt.creditorId !== userId) {
      return forbiddenResponse(res, 'Solo el acreedor puede rechazar');
    }

    await debt.update({ status: 'rejected' });

    return successResponse(res, {});
  } catch (error) {
    console.error('RejectDebt error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al rechazar deuda', 500);
  }
};

export const requestPayment = async (req: Request, res: Response) => {
  try {
    const { debtId } = req.params;
    const userId = req.user!.userId;
    const { paymentDescription } = req.body;

    const debt = await Debt.findByPk(debtId);
    if (!debt) {
      return notFoundResponse(res, 'Deuda');
    }

    if (debt.creditorId !== userId) {
      return forbiddenResponse(res, 'Solo el acreedor puede solicitar pago');
    }

    await debt.update({ status: 'payment_requested', paymentDescription });

    await Notification.create({
      userId: debt.debtorId,
      type: 'payment_request',
      senderId: userId,
      debtId: debt.id,
      message: `Solicitud de pago: ${paymentDescription}`,
    });

    return successResponse(res, { debt: debt.toJSON() });
  } catch (error) {
    console.error('RequestPayment error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al solicitar pago', 500);
  }
};

export const acceptPayment = async (req: Request, res: Response) => {
  try {
    const { debtId } = req.params;
    const userId = req.user!.userId;

    const debt = await Debt.findByPk(debtId);
    if (!debt) {
      return notFoundResponse(res, 'Deuda');
    }

    if (debt.debtorId !== userId) {
      return forbiddenResponse(res, 'Solo el deudor puede aceptar el pago');
    }

    await debt.update({ status: 'in_progress' });

    return successResponse(res, { debt: debt.toJSON() });
  } catch (error) {
    console.error('AcceptPayment error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al aceptar pago', 500);
  }
};

export const rejectPayment = async (req: Request, res: Response) => {
  try {
    const { debtId } = req.params;
    const userId = req.user!.userId;

    const debt = await Debt.findByPk(debtId);
    if (!debt) {
      return notFoundResponse(res, 'Deuda');
    }

    if (debt.debtorId !== userId) {
      return forbiddenResponse(res, 'Solo el deudor puede rechazar el pago');
    }

    const target = await Target.create({
      targetUserId: userId,
      debtId: debt.id,
      reason: 'Rechazó pago de deuda',
    });

    return successResponse(res, { targetStatus: target.toJSON() });
  } catch (error) {
    console.error('RejectPayment error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al rechazar pago', 500);
  }
};

export const markCompleted = async (req: Request, res: Response) => {
  try {
    const { debtId } = req.params;
    const userId = req.user!.userId;

    const debt = await Debt.findByPk(debtId);
    if (!debt) {
      return notFoundResponse(res, 'Deuda');
    }

    if (debt.debtorId !== userId) {
      return forbiddenResponse(res, 'Solo el deudor puede marcar como completado');
    }

    await Notification.create({
      userId: debt.creditorId,
      type: 'completion_request',
      senderId: userId,
      debtId: debt.id,
      message: 'El deudor ha marcado la deuda como completada',
    });

    return successResponse(res, {});
  } catch (error) {
    console.error('MarkCompleted error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al marcar completado', 500);
  }
};

export const confirmCompletion = async (req: Request, res: Response) => {
  try {
    const { debtId } = req.params;
    const userId = req.user!.userId;

    const debt = await Debt.findByPk(debtId);
    if (!debt) {
      return notFoundResponse(res, 'Deuda');
    }

    if (debt.creditorId !== userId) {
      return forbiddenResponse(res, 'Solo el acreedor puede confirmar');
    }

    await debt.update({ status: 'completed' });

    return successResponse(res, {});
  } catch (error) {
    console.error('ConfirmCompletion error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al confirmar', 500);
  }
};

export const rejectCompletion = async (req: Request, res: Response) => {
  try {
    const { debtId } = req.params;
    const userId = req.user!.userId;

    const debt = await Debt.findByPk(debtId);
    if (!debt) {
      return notFoundResponse(res, 'Deuda');
    }

    if (debt.creditorId !== userId) {
      return forbiddenResponse(res, 'Solo el acreedor puede rechazar');
    }

    await debt.update({ status: 'in_progress' });

    return successResponse(res, {});
  } catch (error) {
    console.error('RejectCompletion error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al rechazar', 500);
  }
};
