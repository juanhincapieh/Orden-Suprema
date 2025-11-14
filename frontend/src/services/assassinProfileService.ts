import { AssassinProfile } from '../types';
import { authService } from './authService';

// Get assassin profiles from localStorage
const getProfilesDict = (): Record<string, AssassinProfile> => {
  const stored = localStorage.getItem('assassinProfiles');
  return stored ? JSON.parse(stored) : {};
};

// Set assassin profiles in localStorage
const setProfilesDict = (profiles: Record<string, AssassinProfile>) => {
  localStorage.setItem('assassinProfiles', JSON.stringify(profiles));
};

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateName = (name: string): string | null => {
  if (!name || name.length < 2 || name.length > 50) {
    return 'Name must be between 2 and 50 characters';
  }
  return null;
};

const validateNickname = (nickname: string): string | null => {
  if (!nickname || nickname.length < 2 || nickname.length > 30) {
    return 'Nickname must be between 2 and 30 characters';
  }
  return null;
};

const validateMinContractValue = (value: number): string | null => {
  if (value === undefined || value === null || value <= 0) {
    return 'Minimum contract value must be a positive number';
  }
  return null;
};

const validateSpecialty = (specialty: string): string | null => {
  if (!specialty || specialty.length === 0) {
    return 'Specialty cannot be empty';
  }
  if (specialty.length > 50) {
    return 'Specialty must be 50 characters or less';
  }
  return null;
};

const validateSpecialties = (specialties: string[]): string | null => {
  if (specialties.length > 10) {
    return 'Maximum 10 specialties allowed';
  }
  
  // Check for duplicates
  const uniqueSpecialties = new Set(specialties);
  if (uniqueSpecialties.size !== specialties.length) {
    return 'Duplicate specialties are not allowed';
  }
  
  // Validate each specialty
  for (const specialty of specialties) {
    const error = validateSpecialty(specialty);
    if (error) {
      return error;
    }
  }
  
  return null;
};

export const assassinProfileService = {
  // Get a single assassin profile by email
  getProfile: (email: string): AssassinProfile | null => {
    const profiles = getProfilesDict();
    return profiles[email] || null;
  },

  // Get all assassin profiles
  getAllProfiles: (): AssassinProfile[] => {
    const profiles = getProfilesDict();
    return Object.values(profiles);
  },

  // Update an assassin profile
  updateProfile: (
    email: string,
    updates: Partial<AssassinProfile>
  ): { success: boolean; error?: string } => {
    const profiles = getProfilesDict();
    const existingProfile = profiles[email];

    if (!existingProfile) {
      return { success: false, error: 'Profile not found' };
    }

    // Validate updates
    if (updates.name !== undefined) {
      const error = validateName(updates.name);
      if (error) {
        return { success: false, error };
      }
    }

    if (updates.nickname !== undefined) {
      const error = validateNickname(updates.nickname);
      if (error) {
        return { success: false, error };
      }
    }

    if (updates.email !== undefined && updates.email !== email) {
      // Check if email is valid
      if (!validateEmail(updates.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Check if new email already exists
      const allUsers = authService.getAllUsers();
      const emailExists = allUsers.some(user => user.email === updates.email);
      if (emailExists) {
        return { success: false, error: 'Email already exists' };
      }
    }

    if (updates.minContractValue !== undefined) {
      const error = validateMinContractValue(updates.minContractValue);
      if (error) {
        return { success: false, error };
      }
    }

    if (updates.specialties !== undefined) {
      const error = validateSpecialties(updates.specialties);
      if (error) {
        return { success: false, error };
      }
    }

    // Update profile
    const updatedProfile: AssassinProfile = {
      ...existingProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // If email changed, move profile to new key
    if (updates.email && updates.email !== email) {
      delete profiles[email];
      profiles[updates.email] = updatedProfile;
      updatedProfile.email = updates.email;
      updatedProfile.id = btoa(updates.email);
    } else {
      profiles[email] = updatedProfile;
    }

    setProfilesDict(profiles);
    return { success: true };
  },

  // Migrate existing assassin users to have profiles
  migrateExistingUsers: (): { migrated: number; skipped: number } => {
    const assassins = authService.getAllAssassins();
    const profiles = getProfilesDict();
    let migrated = 0;
    let skipped = 0;

    assassins.forEach(user => {
      // Skip if profile already exists
      if (profiles[user.email]) {
        skipped++;
        return;
      }

      // Create default profile
      profiles[user.email] = {
        id: btoa(user.email),
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        minContractValue: 10000,
        specialties: [],
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      migrated++;
    });

    if (migrated > 0) {
      setProfilesDict(profiles);
    }

    return { migrated, skipped };
  },

  // Validate profile fields
  validateProfile: (profile: Partial<AssassinProfile>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (profile.name !== undefined) {
      const error = validateName(profile.name);
      if (error) errors.name = error;
    }

    if (profile.nickname !== undefined) {
      const error = validateNickname(profile.nickname);
      if (error) errors.nickname = error;
    }

    if (profile.email !== undefined) {
      if (!validateEmail(profile.email)) {
        errors.email = 'Invalid email format';
      }
    }

    if (profile.minContractValue !== undefined) {
      const error = validateMinContractValue(profile.minContractValue);
      if (error) errors.minContractValue = error;
    }

    if (profile.specialties !== undefined) {
      const error = validateSpecialties(profile.specialties);
      if (error) errors.specialties = error;
    }

    return errors;
  }
};
