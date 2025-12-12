import { Request, Response } from 'express';
import { Report, Mission, User } from '../models';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response';

export const createReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { contractId, description } = req.body;

    if (!contractId || !description) {
      return errorResponse(res, 'VALIDATION_ERROR', 'ID de contrato y descripción son requeridos', 400);
    }

    const mission = await Mission.findByPk(contractId);
    if (!mission) {
      return notFoundResponse(res, 'Misión');
    }

    const report = await Report.create({
      missionId: contractId,
      reporterId: userId,
      description,
    });

    const reporter = await User.findByPk(userId);

    return successResponse(
      res,
      {
        report: {
          id: report.id,
          contractId: report.missionId,
          contractTitle: mission.title,
          reporterEmail: reporter?.email || '',
          reporterName: reporter?.nickname || '',
          description: report.description,
          status: report.status,
          createdAt: report.createdAt,
        },
      },
      201
    );
  } catch (error) {
    console.error('CreateReport error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al crear reporte', 500);
  }
};

export const getReports = async (_req: Request, res: Response) => {
  try {
    const reports = await Report.findAll({
      include: [
        { model: Mission, as: 'mission' },
        { model: User, as: 'reporter' },
      ],
    });

    const reportsWithDetails = reports.map((r) => {
      const mission = (r as any).mission;
      const reporter = (r as any).reporter;
      return {
        id: r.id,
        contractId: r.missionId,
        contractTitle: mission?.title || 'Misión eliminada',
        reporterEmail: reporter?.email || '',
        reporterName: reporter?.nickname || '',
        description: r.description,
        status: r.status,
        createdAt: r.createdAt,
      };
    });

    return successResponse(res, { reports: reportsWithDetails });
  } catch (error) {
    console.error('GetReports error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener reportes', 500);
  }
};

export const resolveReport = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findByPk(reportId, {
      include: [
        { model: Mission, as: 'mission' },
        { model: User, as: 'reporter' },
      ],
    });
    if (!report) {
      return notFoundResponse(res, 'Reporte');
    }

    await report.update({ status: 'resolved' });

    const mission = (report as any).mission;
    const reporter = (report as any).reporter;

    return successResponse(res, {
      report: {
        id: report.id,
        contractId: report.missionId,
        contractTitle: mission?.title || 'Misión eliminada',
        reporterEmail: reporter?.email || '',
        reporterName: reporter?.nickname || '',
        description: report.description,
        status: 'resolved',
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error('ResolveReport error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al resolver reporte', 500);
  }
};

export const cancelReport = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findByPk(reportId, {
      include: [
        { model: Mission, as: 'mission' },
        { model: User, as: 'reporter' },
      ],
    });
    if (!report) {
      return notFoundResponse(res, 'Reporte');
    }

    await report.update({ status: 'cancelled' });

    const mission = (report as any).mission;
    const reporter = (report as any).reporter;

    return successResponse(res, {
      report: {
        id: report.id,
        contractId: report.missionId,
        contractTitle: mission?.title || 'Misión eliminada',
        reporterEmail: reporter?.email || '',
        reporterName: reporter?.nickname || '',
        description: report.description,
        status: 'cancelled',
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error('CancelReport error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al cancelar reporte', 500);
  }
};

export const updateReport = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const updates = req.body;

    const report = await Report.findByPk(reportId, {
      include: [
        { model: Mission, as: 'mission' },
        { model: User, as: 'reporter' },
      ],
    });

    if (!report) {
      return notFoundResponse(res, 'Reporte');
    }

    await report.update(updates);

    const mission = (report as any).mission;
    const reporter = (report as any).reporter;

    return successResponse(res, {
      report: {
        id: report.id,
        contractId: report.missionId,
        contractTitle: mission?.title || 'Misión eliminada',
        reporterEmail: reporter?.email || '',
        reporterName: reporter?.nickname || '',
        description: report.description,
        status: report.status,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error('UpdateReport error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al actualizar reporte', 500);
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findByPk(reportId);
    if (!report) {
      return notFoundResponse(res, 'Reporte');
    }

    await report.destroy();

    return successResponse(res, {});
  } catch (error) {
    console.error('DeleteReport error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al eliminar reporte', 500);
  }
};
