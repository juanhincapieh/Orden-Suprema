import { Request, Response } from 'express';
import { User, AssassinProfile, Mission, Review } from '../models';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../utils/response';

const getAssassinStats = async (userId: string) => {
  const completedMissions = await Mission.findAll({
    where: { assassinId: userId, status: 'completed' },
  });
  const activeMissions = await Mission.findAll({
    where: { assassinId: userId, status: 'in_progress' },
  });

  const missionIds = completedMissions.map((m) => m.id);
  const reviews = await Review.findAll({
    where: { missionId: missionIds },
  });

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const totalEarnings = completedMissions.reduce((sum, m) => sum + m.reward, 0);

  return {
    averageRatingAllTime: avgRating,
    averageRatingLastMonth: avgRating,
    completedContracts: completedMissions.length,
    totalEarnings,
    activeContracts: activeMissions.length,
  };
};

export const getAssassinProfiles = async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      where: { role: 'assassin', suspended: false },
      include: [{ model: AssassinProfile, as: 'assassinProfile' }],
    });

    const profiles = await Promise.all(
      users.map(async (user) => {
        const profile = (user as any).assassinProfile;
        const stats = await getAssassinStats(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          minContractValue: profile?.minContractValue || 100,
          specialties: profile?.specialties || [],
          status: profile?.status || 'available',
          location: profile?.location || null,
          stats,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      })
    );

    return successResponse(res, { profiles });
  } catch (error) {
    console.error('GetAssassinProfiles error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener perfiles', 500);
  }
};

export const getAssassinProfile = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({
      where: { email, role: 'assassin' },
      include: [{ model: AssassinProfile, as: 'assassinProfile' }],
    });

    if (!user) {
      return notFoundResponse(res, 'Perfil de asesino');
    }

    const profile = (user as any).assassinProfile;
    const stats = await getAssassinStats(user.id);

    return successResponse(res, {
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        minContractValue: profile?.minContractValue || 100,
        specialties: profile?.specialties || [],
        status: profile?.status || 'available',
        location: profile?.location || null,
        stats,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('GetAssassinProfile error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener perfil', 500);
  }
};

export const updateAssassinProfile = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const userId = req.user!.userId;
    const updates = req.body;

    const user = await User.findOne({
      where: { email, role: 'assassin' },
      include: [{ model: AssassinProfile, as: 'assassinProfile' }],
    });

    if (!user) {
      return notFoundResponse(res, 'Perfil de asesino');
    }

    if (user.id !== userId && req.user!.role !== 'admin') {
      return forbiddenResponse(res, 'No puedes editar este perfil');
    }

    if (updates.name) await user.update({ name: updates.name });
    if (updates.nickname) await user.update({ nickname: updates.nickname });

    let profile = (user as any).assassinProfile;
    if (!profile) {
      profile = await AssassinProfile.create({ userId: user.id });
    }

    if (updates.minContractValue !== undefined) {
      await profile.update({ minContractValue: updates.minContractValue });
    }
    if (updates.specialties) {
      await profile.update({ specialties: updates.specialties });
    }
    if (updates.status) {
      await profile.update({ status: updates.status });
    }
    if (updates.location) {
      await profile.update({
        locationLat: updates.location.lat,
        locationLng: updates.location.lng,
      });
    }
    if (updates.address !== undefined) {
      await profile.update({ address: updates.address });
    }
    if (updates.useAutoLocation !== undefined) {
      await profile.update({ useAutoLocation: updates.useAutoLocation });
    }

    const stats = await getAssassinStats(user.id);

    return successResponse(res, {
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        minContractValue: profile.minContractValue,
        specialties: profile.specialties,
        status: profile.status,
        location: profile.location || null,
        stats,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('UpdateAssassinProfile error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al actualizar perfil', 500);
  }
};


// Actualizar ubicación del asesino
export const updateAssassinLocation = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { lat, lng, address, useAutoLocation } = req.body;

    const user = await User.findOne({
      where: { id: userId, role: 'assassin' },
      include: [{ model: AssassinProfile, as: 'assassinProfile' }],
    });

    if (!user) {
      return notFoundResponse(res, 'Perfil de asesino');
    }

    let profile = (user as any).assassinProfile;
    if (!profile) {
      profile = await AssassinProfile.create({ userId: user.id });
    }

    await profile.update({
      locationLat: lat,
      locationLng: lng,
      address: address || null,
      useAutoLocation: useAutoLocation ?? true,
    });

    return successResponse(res, {
      location: {
        lat: profile.locationLat,
        lng: profile.locationLng,
        address: profile.address,
        useAutoLocation: profile.useAutoLocation,
      },
    });
  } catch (error) {
    console.error('UpdateAssassinLocation error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al actualizar ubicación', 500);
  }
};

// Obtener ubicación del asesino
export const getAssassinLocation = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await User.findOne({
      where: { id: userId, role: 'assassin' },
      include: [{ model: AssassinProfile, as: 'assassinProfile' }],
    });

    if (!user) {
      return notFoundResponse(res, 'Perfil de asesino');
    }

    const profile = (user as any).assassinProfile;

    return successResponse(res, {
      location: profile
        ? {
            lat: profile.locationLat,
            lng: profile.locationLng,
            address: profile.address,
            useAutoLocation: profile.useAutoLocation,
          }
        : null,
    });
  } catch (error) {
    console.error('GetAssassinLocation error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', 'Error al obtener ubicación', 500);
  }
};
