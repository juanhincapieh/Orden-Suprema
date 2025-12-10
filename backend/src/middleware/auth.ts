import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../types';
import { unauthorizedResponse, forbiddenResponse } from '../utils/response';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorizedResponse(res, 'Token no proporcionado');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return unauthorizedResponse(res, 'Token inválido o expirado');
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return unauthorizedResponse(res);
    }

    if (!roles.includes(req.user.role)) {
      return forbiddenResponse(res, 'No tienes permisos para esta acción');
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');
export const requireAssassin = requireRole('assassin');
export const requireContractor = requireRole('contractor');
