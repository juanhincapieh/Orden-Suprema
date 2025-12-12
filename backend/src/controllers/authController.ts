import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, AssassinProfile } from '../models';
import { successResponse, errorResponse, unauthorizedResponse } from '../utils/response';

const generateToken = (user: User): string => {
  const payload = { userId: user.id, email: user.email, role: user.role };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (jwt.sign as any)(payload, config.jwt.secret, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, nickname, role = 'contractor' } = req.body;

    if (!email || !password || !nickname) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Email, password y nickname son requeridos', 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'CONFLICT', 'El email ya está registrado', 409);
    }

    const newUser = await User.create({
      email,
      password,
      name: nickname,
      nickname,
      role: role as 'admin' | 'contractor' | 'assassin',
    });

    // Si es asesino, crear perfil
    if (role === 'assassin') {
      await AssassinProfile.create({ userId: newUser.id });
    }

    const token = generateToken(newUser);

    return successResponse(res, { user: newUser.toSafeJSON(), token }, 201);
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al registrar usuario', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Email y password son requeridos', 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return unauthorizedResponse(res, 'Credenciales inválidas');
    }

    if (user.suspended) {
      return errorResponse(res, 'SUSPENDED', 'Tu cuenta ha sido suspendida', 403);
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return unauthorizedResponse(res, 'Credenciales inválidas');
    }

    const token = generateToken(user);

    return successResponse(res, { user: user.toSafeJSON(), token });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al iniciar sesión', 500);
  }
};

export const logout = (_req: Request, res: Response) => {
  return successResponse(res, {});
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.userId);
    if (!user) {
      return unauthorizedResponse(res, 'Usuario no encontrado');
    }

    // Devolver el usuario directamente (el frontend espera los campos del usuario en data)
    return successResponse(res, user.toSafeJSON());
  } catch (error) {
    console.error('GetMe error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener usuario', 500);
  }
};
