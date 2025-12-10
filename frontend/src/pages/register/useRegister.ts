import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const useRegister = () => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'contractor' | 'assassin'>('contractor');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, getRedirectPath } = useAuth();
  const { isSpanish } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      alert(
        isSpanish
          ? 'Debes aceptar los términos y condiciones'
          : 'You must accept the terms and conditions'
      );
      return;
    }
    if (!isCaptchaVerified) {
      alert(
        isSpanish
          ? 'Por favor completa la verificación de seguridad'
          : 'Please complete the security verification'
      );
      return;
    }

    setIsLoading(true);

    try {
      const success = await register({ email, password, nickname, role });

      if (success) {
        alert(isSpanish ? '¡Cuenta creada exitosamente!' : 'Account created successfully!');
        // Redirigir al panel correspondiente según el rol
        navigate(getRedirectPath());
      } else {
        alert(isSpanish ? 'Este correo ya está registrado' : 'This email is already registered');
      }
    } catch (error) {
      console.error('Register error:', error);
      alert(isSpanish ? 'Error al crear la cuenta' : 'Error creating account');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    nickname,
    setNickname,
    email,
    setEmail,
    password,
    setPassword,
    role,
    setRole,
    showPassword,
    setShowPassword,
    acceptTerms,
    setAcceptTerms,
    isCaptchaVerified,
    setIsCaptchaVerified,
    navigate,
    isSpanish,
    isLoading,
    handleSubmit,
  };
};
