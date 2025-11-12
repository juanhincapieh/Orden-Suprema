import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export const useRegister = () => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'contractor' | 'assassin'>('contractor');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const navigate = useNavigate();

  const isSpanish = navigator.language.toLowerCase().startsWith('es');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      alert(isSpanish ? 'Debes aceptar los términos y condiciones' : 'You must accept the terms and conditions');
      return;
    }
    if (!isCaptchaVerified) {
      alert(isSpanish ? 'Por favor completa la verificación de seguridad' : 'Please complete the security verification');
      return;
    }

    const success = authService.register(email, password, nickname, role);
    
    if (success) {
      alert(isSpanish ? '¡Cuenta creada exitosamente!' : 'Account created successfully!');
      navigate('/login');
    } else {
      alert(isSpanish ? 'Este correo ya está registrado' : 'This email is already registered');
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
    handleSubmit
  };
};
