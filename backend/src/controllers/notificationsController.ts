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
        senderName: sender?.nickname || null,
        amount: n.amount,
        message: n.message,
        debtId: n.debtId,
        missionId: n.missionId,
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
