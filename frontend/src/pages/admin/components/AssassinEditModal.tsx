import { useState, useEffect, useMemo } from 'react';
import { X, CircleDollarSign } from 'lucide-react';
import { AssassinProfile } from '../../../types';
import { assassinProfileService } from '../../../services/assassinProfileService';
import styles from './AssassinEditModal.module.css';

export interface AssassinEditModalProps {
  isOpen: boolean;
  assassin: AssassinProfile | null;
  onClose: () => void;
  onSave: (updatedProfile: Partial<AssassinProfile>) => Promise<void>;
  isSpanish: boolean;
}

export const AssassinEditModal = ({
  isOpen,
  assassin,
  onClose,
  onSave,
  isSpanish
}: AssassinEditModalProps) => {
  const [formData, setFormData] = useState<Partial<AssassinProfile>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');

  // Initialize form data when assassin changes
  useEffect(() => {
    if (assassin) {
      setFormData({
        name: assassin.name,
        nickname: assassin.nickname,
        email: assassin.email,
        minContractValue: assassin.minContractValue,
        status: assassin.status,
        specialties: [...(assassin.specialties || [])]
      });
      setErrors({});
      setNewSpecialty('');
    }
  }, [assassin]);

  const translations = useMemo(() => ({
    title: isSpanish ? 'Editar Perfil de Asesino' : 'Edit Assassin Profile',
    name: isSpanish ? 'Nombre' : 'Name',
    nickname: isSpanish ? 'Apodo' : 'Nickname',
    email: isSpanish ? 'Email' : 'Email',
    minContractValue: isSpanish ? 'Valor Mínimo de Contrato' : 'Minimum Contract Value',
    status: isSpanish ? 'Estado' : 'Status',
    specialties: isSpanish ? 'Especialidades' : 'Specialties',
    addSpecialty: isSpanish ? 'Agregar' : 'Add',
    specialtyPlaceholder: isSpanish ? 'Ej: Sigilo, Combate...' : 'Ex: Stealth, Combat...',
    cancel: isSpanish ? 'Cancelar' : 'Cancel',
    saveChanges: isSpanish ? 'Guardar Cambios' : 'Save Changes',
    saving: isSpanish ? 'Guardando...' : 'Saving...',
    statusOptions: {
      available: isSpanish ? 'Disponible' : 'Available',
      busy: isSpanish ? 'Ocupado' : 'Busy',
      inactive: isSpanish ? 'Inactivo' : 'Inactive'
    },
    errors: {
      nameLength: isSpanish 
        ? 'El nombre debe tener entre 2 y 50 caracteres' 
        : 'Name must be between 2 and 50 characters',
      nicknameLength: isSpanish 
        ? 'El apodo debe tener entre 2 y 30 caracteres' 
        : 'Nickname must be between 2 and 30 characters',
      emailInvalid: isSpanish ? 'Email inválido' : 'Invalid email',
      emailExists: isSpanish ? 'Este email ya existe' : 'Email already exists',
      minValuePositive: isSpanish 
        ? 'El valor mínimo debe ser positivo' 
        : 'Minimum value must be positive',
      specialtyLength: isSpanish 
        ? 'La especialidad debe tener máximo 50 caracteres' 
        : 'Specialty must be 50 characters or less',
      specialtyDuplicate: isSpanish 
        ? 'Esta especialidad ya existe' 
        : 'This specialty already exists',
      specialtyMax: isSpanish 
        ? 'Máximo 10 especialidades permitidas' 
        : 'Maximum 10 specialties allowed',
      specialtyEmpty: isSpanish 
        ? 'La especialidad no puede estar vacía' 
        : 'Specialty cannot be empty'
    }
  }), [isSpanish]);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form field
  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case 'name':
        if (!value || value.length < 2 || value.length > 50) {
          return translations.errors.nameLength;
        }
        break;
      case 'nickname':
        if (!value || value.length < 2 || value.length > 30) {
          return translations.errors.nicknameLength;
        }
        break;
      case 'email':
        if (!value || !validateEmail(value)) {
          return translations.errors.emailInvalid;
        }
        break;
      case 'minContractValue':
        if (value === undefined || value === null || value <= 0) {
          return translations.errors.minValuePositive;
        }
        break;
    }
    return null;
  };

  // Handle input change
  const handleInputChange = (field: keyof AssassinProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Add specialty
  const handleAddSpecialty = () => {
    const trimmedSpecialty = newSpecialty.trim();
    
    if (!trimmedSpecialty) {
      setErrors(prev => ({ ...prev, specialty: translations.errors.specialtyEmpty }));
      return;
    }
    
    if (trimmedSpecialty.length > 50) {
      setErrors(prev => ({ ...prev, specialty: translations.errors.specialtyLength }));
      return;
    }
    
    const currentSpecialties = formData.specialties || [];
    
    if (currentSpecialties.includes(trimmedSpecialty)) {
      setErrors(prev => ({ ...prev, specialty: translations.errors.specialtyDuplicate }));
      return;
    }
    
    if (currentSpecialties.length >= 10) {
      setErrors(prev => ({ ...prev, specialty: translations.errors.specialtyMax }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      specialties: [...currentSpecialties, trimmedSpecialty]
    }));
    setNewSpecialty('');
    
    // Clear specialty error
    if (errors.specialty) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.specialty;
        return newErrors;
      });
    }
  };

  // Remove specialty
  const handleRemoveSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: (prev.specialties || []).filter((_, i) => i !== index)
    }));
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    const nameError = validateField('name', formData.name);
    if (nameError) newErrors.name = nameError;
    
    const nicknameError = validateField('nickname', formData.nickname);
    if (nicknameError) newErrors.nickname = nicknameError;
    
    const emailError = validateField('email', formData.email);
    if (emailError) newErrors.email = emailError;
    
    const minValueError = validateField('minContractValue', formData.minContractValue);
    if (minValueError) newErrors.minContractValue = minValueError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      // Handle specific errors
      if (error.message?.includes('email') || error.message?.includes('Email')) {
        setErrors(prev => ({ ...prev, email: translations.errors.emailExists }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !assassin) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={() => !isLoading && onClose()}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          disabled={isLoading}
          aria-label={isSpanish ? 'Cerrar' : 'Close'}
        >
          <X size={24} />
        </button>

        <h2 className={styles.modalTitle}>{translations.title}</h2>

        <div className={styles.assassinHeader}>
          <div className={styles.assassinAvatar}>
            {assassin.name.charAt(0).toUpperCase()}
          </div>
          <div 
            className={styles.currentStatusBadge}
            data-status={assassin.status}
          >
            {translations.statusOptions[assassin.status]}
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="name">
              {translations.name}
            </label>
            <input
              id="name"
              type="text"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isLoading}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span id="name-error" className={styles.errorMessage}>
                {errors.name}
              </span>
            )}
          </div>

          {/* Nickname Field */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="nickname">
              {translations.nickname}
            </label>
            <input
              id="nickname"
              type="text"
              className={`${styles.input} ${errors.nickname ? styles.inputError : ''}`}
              value={formData.nickname || ''}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              disabled={isLoading}
              aria-describedby={errors.nickname ? 'nickname-error' : undefined}
            />
            {errors.nickname && (
              <span id="nickname-error" className={styles.errorMessage}>
                {errors.nickname}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              {translations.email}
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isLoading}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className={styles.errorMessage}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Min Contract Value Field */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="minContractValue">
              {translations.minContractValue}
            </label>
            <div className={styles.inputWithIcon}>
              <input
                id="minContractValue"
                type="number"
                className={`${styles.input} ${errors.minContractValue ? styles.inputError : ''}`}
                value={formData.minContractValue || ''}
                onChange={(e) => handleInputChange('minContractValue', Number(e.target.value))}
                min="0"
                disabled={isLoading}
                aria-describedby={errors.minContractValue ? 'minContractValue-error' : undefined}
              />
              <span className={styles.inputIcon}><CircleDollarSign size={20} /></span>
            </div>
            {errors.minContractValue && (
              <span id="minContractValue-error" className={styles.errorMessage}>
                {errors.minContractValue}
              </span>
            )}
          </div>

          {/* Status Field */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="status">
              {translations.status}
            </label>
            <select
              id="status"
              className={styles.select}
              value={formData.status || 'available'}
              onChange={(e) => handleInputChange('status', e.target.value as 'available' | 'busy' | 'inactive')}
              disabled={isLoading}
            >
              <option value="available">{translations.statusOptions.available}</option>
              <option value="busy">{translations.statusOptions.busy}</option>
              <option value="inactive">{translations.statusOptions.inactive}</option>
            </select>
          </div>

          {/* Specialties Field */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="specialty">
              {translations.specialties}
            </label>
            <div className={styles.specialtyInput}>
              <input
                id="specialty"
                type="text"
                className={`${styles.input} ${errors.specialty ? styles.inputError : ''}`}
                placeholder={translations.specialtyPlaceholder}
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSpecialty();
                  }
                }}
                disabled={isLoading}
                aria-describedby={errors.specialty ? 'specialty-error' : undefined}
              />
              <button
                type="button"
                className={styles.addButton}
                onClick={handleAddSpecialty}
                disabled={isLoading}
              >
                {translations.addSpecialty}
              </button>
            </div>
            {errors.specialty && (
              <span id="specialty-error" className={styles.errorMessage}>
                {errors.specialty}
              </span>
            )}
            
            {/* Specialty Tags */}
            {formData.specialties && formData.specialties.length > 0 && (
              <div className={styles.specialtyTags}>
                {formData.specialties.map((specialty, index) => (
                  <div key={index} className={styles.specialtyTag}>
                    <span>{specialty}</span>
                    <button
                      type="button"
                      className={styles.removeTagButton}
                      onClick={() => handleRemoveSpecialty(index)}
                      disabled={isLoading}
                      aria-label={`${isSpanish ? 'Eliminar' : 'Remove'} ${specialty}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isLoading}
            >
              {translations.cancel}
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading ? translations.saving : translations.saveChanges}
            </button>
          </div>
        </form>

        {/* Loading Overlay */}
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
          </div>
        )}
      </div>
    </div>
  );
};
