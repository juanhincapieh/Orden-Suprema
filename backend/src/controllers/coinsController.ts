import { Request, Response } from 'express';
import { User, Transaction, Notification } from '../models';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';

export const getBalance = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.userId);
    if (!user) {
      return notFoundResponse(res, 'Usuario');
    }

    return successResponse(res, { balance: user.coins });
  } catch (error) {
    console.error('GetBalance error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener balance', 500);
  }
};

export const purchaseCoins = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { packageId, amount } = req.body;

    if (!amount || amount <= 0) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Cantidad inválida', 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return notFoundResponse(res, 'Usuario');
    }

    await user.update({ coins: user.coins + amount });

    const transaction = await Transaction.create({
      userId,
      type: 'purchase',
      amount,
      description: `Compra de ${amount} monedas (Paquete: ${packageId || 'custom'})`,
    });

    return successResponse(res, {
      newBalance: user.coins + amount,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error('PurchaseCoins error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al comprar monedas', 500);
  }
};

export const transferCoins = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { recipientEmail, amount, message } = req.body;

    if (!recipientEmail || !amount || amount <= 0) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Email del destinatario y cantidad son requeridos', 400);
    }

    const sender = await User.findByPk(userId);
    if (!sender) {
      return notFoundResponse(res, 'Usuario');
    }

    if (sender.coins < amount) {
      return errorResponse(res, 'INSUFFICIENT_FUNDS', 'No tienes suficientes monedas', 400);
    }

    const recipient = await User.findOne({ where: { email: recipientEmail } });
    if (!recipient) {
      return notFoundResponse(res, 'Destinatario');
    }

    if (recipient.id === userId) {
      return errorResponse(res, 'INVALID_TRANSFER', 'No puedes transferirte a ti mismo', 400);
    }

    await sender.update({ coins: sender.coins - amount });
    await recipient.update({ coins: recipient.coins + amount });

    const senderTransaction = await Transaction.create({
      userId,
      type: 'payment',
      amount: -amount,
      description: `Transferencia a ${recipient.nickname}${message ? `: ${message}` : ''}`,
    });

    await Transaction.create({
      userId: recipient.id,
      type: 'payment',
      amount,
      description: `Transferencia de ${sender.nickname}${message ? `: ${message}` : ''}`,
    });

    await Notification.create({
      userId: recipient.id,
      type: 'transfer',
      senderId: userId,
      amount,
      message: message || `Has recibido ${amount} monedas de ${sender.nickname}`,
    });

    return successResponse(res, {
      newBalance: sender.coins - amount,
      transaction: {
        id: senderTransaction.id,
        type: senderTransaction.type,
        amount: senderTransaction.amount,
        description: senderTransaction.description,
        date: senderTransaction.createdAt,
      },
    });
  } catch (error) {
    console.error('TransferCoins error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al transferir monedas', 500);
  }
};
