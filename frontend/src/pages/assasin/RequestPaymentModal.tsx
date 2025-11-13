import { useState } from 'react';
import { Debt } from '../../services/debtService';
import styles from '../Assassins/RequestFavorModal.module.css'; // Reutilizar estilos

interface RequestPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt;
  assassinName: string;
  isSpanish: boolean;
  onSubmit: (description: string) => void;
}

export const RequestPaymentModal = ({
  isOpen,
  onClose,
  debt,
  assassinName,
  isSpanish,
  onSubmit
}: RequestPaymentModalProps) => {
  const [paymentDescription, setPaymentDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar longitud
    if (paymentDescription.trim().length < 10) {
      setError(isSpanish 
        ? 'La descripción debe tener al menos 10 caracteres' 
        : 'Description must be at least 10 characters');
      return;
    }

    if (paymentDescription.length > 500) {
      setError(isSpanish 
        ? 'La descripción no puede exceder 500 caracteres' 
        : 'Description cannot exceed 500 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      onSubmit(paymentDescription.trim());
      alert(isSpanish 
        ? `¡Solicitud de pago enviada a ${assassinName}!` 
        : `Payment request sent to ${assassinName}!`);
    } catch (err: any) {
      console.error('Error requesting payment:', err);
      setError(err.message);
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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} disabled={isSubmitting}>
          ✕
        </button>

        <h2 className={styles.modalTitle}>
          {isSpanish ? 'Solicitar Pago de Deuda' : 'Request Debt Payment'}
        </h2>

        <div className={styles.targetInfo}>
          <div className={styles.targetAvatar}>
            {assassinName.charAt(0)}
          </div>
          <div>
            <h3 className={styles.targetName}>{assassinName}</h3>
            <p className={styles.targetNickname}>
              {isSpanish ? 'Te debe un favor' : 'Owes you a favor'}
            </p>
          </div>
        </div>

        <div style={{ 
          padding: '0.75rem', 
          background: 'var(--gold-alpha-10)', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          <strong>{isSpanish ? 'Favor original:' : 'Original favor:'}</strong>
          <p style={{ margin: '0.5rem 0 0 0', fontStyle: 'italic' }}>
            "{debt.favorDescription}"
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="paymentDescription" className={styles.label}>
              {isSpanish ? 'Describe el favor que solicitas como pago:' : 'Describe the favor you request as payment:'}
            </label>
            <textarea
              id="paymentDescription"
              className={styles.textarea}
              value={paymentDescription}
              onChange={(e) => setPaymentDescription(e.target.value)}
              placeholder={isSpanish 
                ? 'Ej: Necesito que elimines un objetivo en París...' 
                : 'Ex: I need you to eliminate a target in Paris...'}
              rows={5}
              disabled={isSubmitting}
              required
            />
            <div className={styles.charCount}>
              {paymentDescription.length} / 500
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              ⚠️ {error}
            </div>
          )}

          <div className={styles.warning}>
            <span className={styles.warningIcon}>💡</span>
            <span>
              {isSpanish 
                ? 'El deudor puede aceptar o rechazar. Si rechaza, será marcado como objetivo.' 
                : 'The debtor can accept or reject. If they reject, they will be marked as target.'}
            </span>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              {isSpanish ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || paymentDescription.trim().length < 10}
            >
              {isSubmitting 
                ? (isSpanish ? 'Enviando...' : 'Sending...') 
                : (isSpanish ? 'Solicitar Pago' : 'Request Payment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
