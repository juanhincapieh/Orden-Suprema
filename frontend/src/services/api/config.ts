// API Configuration - Shared config to avoid circular dependencies

// Determinar si usar modo mock
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;

// Helper para obtener usuario actual
export const getCurrentUserEmail = (): string | null => {
  const stored = localStorage.getItem('currentUser');
  if (!stored) return null;
  try {
    return JSON.parse(stored).email;
  } catch {
    return null;
  }
};

export const getCurrentUserId = (): string | null => {
  const stored = localStorage.getItem('currentUser');
  if (!stored) return null;
  try {
    return JSON.parse(stored).id;
  } catch {
    return null;
  }
};
