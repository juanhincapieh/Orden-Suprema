import { useState, useEffect } from 'react';
import styles from './RegisterDebtModal.module.css';

interface Assassin {
  email: string;
  name: string;
  nickname: string;
}

interface RegisterDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (creditorEmail: string, description: string) => void;
  isSpanish: boolean;
  currentUserEmail: string;
  availableAssassins: Assassin[];
}

export const RegisterDebtModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSpanish,
  currentUserEmail,
  availableAssassins
}: RegisterDebtModalProps) => {
  const [creditorEmail, setCreditorEmail] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCreditorEmail('');
      setDescription('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!creditorEmail.trim()) {
      setError(isSpanish ? 'Ingresa el email del asesino' : 'Enter the assassin email');
      return;
    }

    if (creditorEmail === currentUserEmail) {
      setError(isSpanish ? 'No puedes registrar una deuda contigo mismo' : 'You cannot register a debt with yourself');
      return;
    }

    if (!description.trim()) {
      setError(isSpanish ? 'Describe el favor que te hicieron' : 'Describe the favor they did for you');
      return;
    }

    if (description.length < 10) {
      setError(isSpanish ? 'La descripción debe tener al menos 10 caracteres' : 'Description must be at least 10 characters');
      return;
    }

    if (description.length > 500) {
      setError(isSpanish ? 'La descripción no puede exceder 500 caracteres' : 'Description cannot exceed 500 characters');
      return;
    }

    onSubmit(creditorEmail.trim(), description.trim());
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>
          ✕
        </button>

        <h2 className={styles.modalTitle}>
          {isSpanish ? '📝 Registrar deuda que debo' : '📝 Register debt I owe'}
        </h2>

        <p className={styles.modalDescription}>
          {isSpanish 
            ? 'Registra un favor que otro asesino te hizo. Reconoces que le debes un favor y deberás pagarlo cuando te lo solicite.'
            : 'Register a favor another assassin did for you. You acknowledge that you owe them a favor and must pay it when requested.'}
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="creditorEmail">
              {isSpanish ? 'Asesino (A quien le debo)' : 'Assassin (Who I owe)'}
            </label>
            <select
              id="creditorEmail"
              className={styles.select}
              value={creditorEmail}
              onChange={(e) => setCreditorEmail(e.target.value)}
              required
            >
              <option value="">
                {isSpanish ? 'Selecciona un asesino...' : 'Select an assassin...'}
              </option>
              {availableAssassins
                .filter(assassin => assassin.email !== currentUserEmail)
                .map((assassin) => (
                  <option key={assassin.email} value={assassin.email}>
                    {assassin.nickname || assassin.name} ({assassin.email})
                  </option>
                ))}
            </select>
            <span className={styles.hint}>
              {isSpanish 
                ? 'El asesino que te hizo el favor'
                : 'The assassin who did you the favor'}
            </span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="description">
              {isSpanish ? 'Descripción del Favor que me hicieron' : 'Description of Favor they did for me'}
            </label>
            <textarea
              id="description"
              className={styles.textarea}
              placeholder={isSpanish 
                ? 'Ej: Me ayudó a eliminar un objetivo difícil, me cubrió en una misión, me prestó equipo...'
                : 'Ex: Helped me eliminate a difficult target, covered for me on a mission, lent me equipment...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
            <span className={styles.hint}>
              {description.length}/500 {isSpanish ? 'caracteres' : 'characters'}
            </span>
          </div>

          {error && (
            <div className={styles.error}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
            >
              {isSpanish ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              className={styles.submitButton}
            >
              <span>💰</span>
              <span>{isSpanish ? 'Registrar Deuda' : 'Register Debt'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
