// API Service - Unified service that switches between mock and real backend
import baseApi, { ApiError } from '../apiService';

// Determinar si usar modo mock
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;

export { ApiError };
export { USE_MOCK };

// Re-exportar el api base
export const api = baseApi;

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

// Re-exportar todos los servicios API
export { missionsApi } from './missionsApi';
export { notificationsApi } from './notificationsApi';
export { usersApi } from './usersApi';
export { coinsApi } from './coinsApi';
export { reportsApi } from './reportsApi';

export default api;
