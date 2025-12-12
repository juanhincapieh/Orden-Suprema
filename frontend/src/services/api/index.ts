// API Service - Unified service that switches between mock and real backend
import baseApi, { ApiError } from '../apiService';

// Re-exportar config (USE_MOCK y helpers)
export { USE_MOCK, getCurrentUserEmail, getCurrentUserId } from './config';

export { ApiError };

// Re-exportar el api base
export const api = baseApi;

// Re-exportar todos los servicios API
export { missionsApi } from './missionsApi';
export { notificationsApi } from './notificationsApi';
export type { Notification } from './notificationsApi';
export { usersApi } from './usersApi';
export { coinsApi } from './coinsApi';
export { reportsApi } from './reportsApi';
export { debtsService as debtsApi, debtsUtils } from './debtsApi';
export type { Debt, DebtNotification, TargetStatus } from './debtsApi';

export default api;
