import { Request, Response } from 'express';
import { Mission, User, Review } from '../models';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../utils/response';

export const createReview = async (req: Request, res: Response) => {
  try {
    const { missionId } = req.params;
    const userId = req.user!.userId;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Rating debe ser entre 1 y 5', 400);
    }

    const mission = await Mission.findByPk(missionId);
    if (!mission) {
      return notFoundResponse(res, 'Misión');
    }

    if (mission.status !== 'completed') {
      return errorResponse(res, 'INVALID_STATUS', 'Solo puedes reseñar misiones completadas', 400);
    }

    if (mission.contractorId !== userId) {
      return forbiddenResponse(res, 'Solo el contratista puede dejar reseña');
    }

    const existingReview = await Review.findOne({ where: { missionId } });
    if (existingReview) {
      await existingReview.update({ rating, comment: comment || '' });
      return successResponse(res, { review: existingReview.toJSON() });
    }

    const review = await Review.create({
      missionId,
      reviewerId: userId,
      rating,
      comment: comment || '',
    });

    return successResponse(res, { review: review.toJSON() }, 201);
  } catch (error) {
    console.error('CreateReview error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al crear reseña', 500);
  }
};

export const getAllReviews = async (_req: Request, res: Response) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: Mission,
          as: 'mission',
          include: [
            { model: User, as: 'contractor' },
            { model: User, as: 'assassin' },
          ],
        },
      ],
    });

    const reviewsWithDetails = reviews.map((review) => {
      const mission = (review as any).mission;
      return {
        id: review.id,
        missionTitle: mission?.title || 'Misión eliminada',
        assassinName: mission?.assassin?.nickname || 'Desconocido',
        contractorName: mission?.contractor?.nickname || 'Desconocido',
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      };
    });

    return successResponse(res, { reviews: reviewsWithDetails });
  } catch (error) {
    console.error('GetAllReviews error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener reseñas', 500);
  }
};
