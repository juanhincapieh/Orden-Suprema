import { Request, Response } from 'express';
import { User, AssassinProfile } from '../models';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';

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

    const assassins = users.map((u) => {
      const profile = (u as any).assassinProfile;
      return {
        id: u.id,
        email: u.email,
        nickname: u.nickname,
        rating: 4.5, // TODO: calcular desde reviews
        completedContracts: 0, // TODO: calcular desde missions
        status: profile?.status || 'available',
        location: profile?.location || null,
      };
    });

    return successResponse(res, { assassins });
  } catch (error) {
    console.error('GetAssassins error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener asesinos', 500);
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
