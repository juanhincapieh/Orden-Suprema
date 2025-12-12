import { useState } from 'react';
import { X, TriangleAlert, CheckCircle } from 'lucide-react';
import { AssassinProfile } from './useAssassins';
import { debtsApi } from '../../services/api';
import styles from './RequestFavorModal.module.css';

interface User {
  email: string;
  role: string;
  name?: string;
  nickname?: string;
}

interface RequestFavorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAssassin: AssassinProfile;
  currentUser: User;
  isSpanish: boolean;
  onSuccess: () => void;
}

export const RequestFavorModal = ({
  isOpen,
  onClose,
  targetAssassin,
  currentUser: _currentUser,
  isSpanish,
  onSuccess
}: RequestFavorModalProps) => {
  const [favorDescription, setFavorDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validar longitud
      if (favorDescription.trim().length < 10) {
        throw new Error(
          isSpanish
            ? 'La descripción debe tener al menos 10 caracteres'
            : 'Description must be at least 10 characters'
        );
      }

      if (favorDescription.length > 500) {
        throw new Error(
          isSpanish
            ? 'La descripción no puede exceder 500 caracteres'
            : 'Description cannot exceed 500 characters'
        );
      }

      // Crear solicitud de favor usando el servicio API unificado
      // Obtener email del asesino desde su ID (base64)
      const creditorEmail = atob(targetAssassin.id);

      await debtsApi.createFavorRequest({
        creditorEmail,
        description: favorDescription
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || (isSpanish ? 'Error al enviar solicitud' : 'Error sending request'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose} type="button">
          <X size={20} />
        </button>

        <h2 className={styles.modalTitle}>
          {isSpanish ? 'Solicitar Favor' : 'Request Favor'}
        </h2>

        <div className={styles.targetInfo}>
          <div className={styles.targetAvatar}>
            {targetAssassin.name.charAt(0)}
          </div>
          <div>
            <h3 className={styles.targetName}>{targetAssassin.name}</h3>
            <p className={styles.targetNickname}>"{targetAssassin.nickname}"</p>
          </div>
        </div>

        {success ? (
          <div className={styles.successMessage}>
            <span className={styles.successIcon}><CheckCircle size={48} /></span>
            <p>
              {isSpanish
                ? '¡Solicitud enviada con éxito!'
                : 'Request sent successfully!'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="favorDescription" className={styles.label}>
                {isSpanish
                  ? 'Describe el favor que necesitas:'
                  : 'Describe the favor you need:'}
              </label>
              <textarea
                id="favorDescription"
                value={favorDescription}
                onChange={(e) => setFavorDescription(e.target.value)}
                className={styles.textarea}
                placeholder={
                  isSpanish
                    ? 'Ej: Necesito información sobre un objetivo en Berlín...'
                    : 'Ex: I need information about a target in Berlin...'
                }
                rows={5}
                disabled={isSubmitting}
                required
              />
              <div className={styles.charCount}>
                {favorDescription.length} / 500
              </div>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}><TriangleAlert size={20} /></span>
                <p>{error}</p>
              </div>
            )}

            <div className={styles.warningBox}>
              <span className={styles.warningIcon}><TriangleAlert size={20} /></span>
              <p>
                {isSpanish
                  ? 'Esto creará una deuda que deberás pagar cuando te lo soliciten'
                  : 'This will create a debt that you must pay when requested'}
              </p>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
                disabled={isSubmitting}
              >
                {isSpanish ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || favorDescription.trim().length < 10}
              >
                {isSubmitting
                  ? isSpanish
                    ? 'Enviando...'
                    : 'Sending...'
                  : isSpanish
                  ? 'Enviar Solicitud'
                  : 'Send Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
