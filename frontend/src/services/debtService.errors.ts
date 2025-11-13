export const ERROR_MESSAGES = {
  es: {
    selfRequest: 'No puedes solicitar un favor a ti mismo',
    duplicateRequest: 'Ya tienes una solicitud pendiente con este asesino',
    shortDescription: 'La descripción debe tener al menos 10 caracteres',
    longDescription: 'La descripción no puede exceder 500 caracteres',
    invalidStatus: 'No puedes realizar esta acción en el estado actual de la deuda',
    notFound: 'Deuda no encontrada',
    notificationNotFound: 'Notificación no encontrada',
    unauthorized: 'No tienes permiso para realizar esta acción',
    debtNotPending: 'La deuda no está en estado pendiente',
    debtNotActive: 'La deuda debe estar activa para solicitar pago',
    debtNotPaymentRequested: 'La deuda no está en estado de pago solicitado',
    debtNotInProgress: 'La deuda debe estar en curso para marcarla como completada'
  },
  en: {
    selfRequest: 'You cannot request a favor from yourself',
    duplicateRequest: 'You already have a pending request with this assassin',
    shortDescription: 'Description must be at least 10 characters',
    longDescription: 'Description cannot exceed 500 characters',
    invalidStatus: 'You cannot perform this action in the current debt status',
    notFound: 'Debt not found',
    notificationNotFound: 'Notification not found',
    unauthorized: 'You do not have permission to perform this action',
    debtNotPending: 'Debt is not in pending status',
    debtNotActive: 'Debt must be active to request payment',
    debtNotPaymentRequested: 'Debt is not in payment_requested status',
    debtNotInProgress: 'Debt must be in_progress to mark as completed'
  }
};

export type ErrorKey = keyof typeof ERROR_MESSAGES.es;

export function getErrorMessage(key: ErrorKey, language: 'es' | 'en' = 'en'): string {
  return ERROR_MESSAGES[language][key];
}
