import { Request, Response } from 'express';
import { Transaction, User } from '../models';
import { successResponse, errorResponse } from '../utils/response';

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { userId: queryUserId, type } = req.query;

    const where: any = {};

    if (userRole !== 'admin') {
      where.userId = userId;
    } else if (queryUserId) {
      where.userId = queryUserId;
    }

    if (type) {
      where.type = type;
    }

    const transactions = await Transaction.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user' }],
    });

    const transactionsWithDetails = transactions.map((t) => {
      const user = (t as any).user;
      return {
        id: t.id,
        userId: t.userId,
        userEmail: user?.email || 'Desconocido',
        userName: user?.nickname || 'Desconocido',
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.createdAt,
      };
    });

    return successResponse(res, { transactions: transactionsWithDetails });
  } catch (error) {
    console.error('GetTransactions error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener transacciones', 500);
  }
};
