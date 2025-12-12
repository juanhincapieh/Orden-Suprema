import { Response } from 'express';

export const successResponse = <T>(res: Response, data: T, status = 200) => {
  return res.status(status).json({ success: true, data });
};

export const errorResponse = (
  res: Response,
  code: string,
  message: string,
  status = 400,
  details?: unknown
) => {
  return res.status(status).json({
    success: false,
    error: { code, message, details: details || null },
  });
};

export const notFoundResponse = (res: Response, resource: string) => {
  return errorResponse(res, 'NOT_FOUND', `${resource} no encontrado`, 404);
};

export const unauthorizedResponse = (res: Response, message = 'No autorizado') => {
  return errorResponse(res, 'UNAUTHORIZED', message, 401);
};

export const forbiddenResponse = (res: Response, message = 'Sin permisos') => {
  return errorResponse(res, 'FORBIDDEN', message, 403);
};
