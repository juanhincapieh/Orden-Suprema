import { Request, Response } from 'express';
import { Notification, User } from '../models';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'sender' }],
    });

    const notificationsWithDetails = notifications.map((n) => {
      const sender = (n as any).sender;
      return {
        id: n.id,
        type: n.type,
        senderEmail: sender?.email || null,
        senderName: n.senderName || sender?.nickname || null,
        amount: n.amount,
        message: n.message,
        debtId: n.debtId,
        missionId: n.missionId,
        missionTitle: n.missionTitle || null,
        missionReward: n.missionReward || null,
        status: n.status || null,
        read: n.read,
        createdAt: n.createdAt,
      };
    });

    return successResponse(res, { notifications: notificationsWithDetails });
  } catch (error) {
    console.error('GetNotifications error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener notificaciones', 500);
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user!.userId;

    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    });
    if (!notification) {
      return notFoundResponse(res, 'Notificación');
    }

    await notification.update({ read: true });

    return successResponse(res, {});
  } catch (error) {
    console.error('MarkAsRead error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al marcar notificación', 500);
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    await Notification.update({ read: true }, { where: { userId, read: false } });

    return successResponse(res, {});
  } catch (error) {
    console.error('MarkAllAsRead error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al marcar notificaciones', 500);
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user!.userId;

    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    });
    if (!notification) {
      return notFoundResponse(res, 'Notificación');
    }

    await notification.destroy();

    return successResponse(res, {});
  } catch (error) {
    console.error('DeleteNotification error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al eliminar notificación', 500);
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const count = await Notification.count({
      where: { userId, read: false },
    });

    return successResponse(res, { count });
  } catch (error) {
    console.error('GetUnreadCount error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al contar notificaciones', 500);
  }
};

// Crear notificación de asignación de misión
export const createMissionAssignment = async (req: Request, res: Response) => {
  try {
    const { recipientId, recipientEmail, missionId, missionTitle, missionReward } = req.body;
    const senderId = req.user!.userId;

    // Obtener nombre del remitente
    const sender = await User.findByPk(senderId);
    if (!sender) {
      return errorResponse(res, 'NOT_FOUND', 'Usuario no encontrado', 404);
    }

    // Resolver el destinatario - puede venir como ID o como email
    let targetUserId = recipientId;
    if (!targetUserId && recipientEmail) {
      const recipient = await User.findOne({ where: { email: recipientEmail } });
      if (!recipient) {
        return errorResponse(res, 'NOT_FOUND', 'Destinatario no encontrado', 404);
      }
      targetUserId = recipient.id;
    }

    if (!targetUserId) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Se requiere recipientId o recipientEmail', 400);
    }

    const notification = await Notification.create({
      userId: targetUserId,
      type: 'mission_assignment',
      senderId,
      senderName: sender.nickname || sender.email,
      missionId,
      missionTitle,
      missionReward,
      status: 'pending',
      read: false,
    });

    return successResponse(res, { notification }, 201);
  } catch (error) {
    console.error('CreateMissionAssignment error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al crear notificación', 500);
  }
};

// Obtener notificaciones de asignación de misión pendientes
export const getPendingMissionAssignments = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const notifications = await Notification.findAll({
      where: {
        userId,
        type: 'mission_assignment',
        status: 'pending',
      },
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, { notifications });
  } catch (error) {
    console.error('GetPendingMissionAssignments error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener asignaciones pendientes', 500);
  }
};

// Actualizar estado de notificación de asignación de misión
export const updateMissionAssignmentStatus = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const { status } = req.body;
    const userId = req.user!.userId;

    if (!['accepted', 'rejected', 'expired'].includes(status)) {
      return errorResponse(res, 'INVALID_STATUS', 'Estado inválido', 400);
    }

    const notification = await Notification.findOne({
      where: { id: notificationId, userId, type: 'mission_assignment' },
    });

    if (!notification) {
      return notFoundResponse(res, 'Notificación');
    }

    await notification.update({ status, read: true });

    return successResponse(res, { notification });
  } catch (error) {
    console.error('UpdateMissionAssignmentStatus error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al actualizar estado', 500);
  }
};
