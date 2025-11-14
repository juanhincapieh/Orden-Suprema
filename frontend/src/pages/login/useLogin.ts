import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [userPendingLogin, setUserPendingLogin] = useState<any>(null);
  const navigate = useNavigate();

  const { isSpanish } = useLanguage();

  // Generar código 2FA de 6 dígitos
  const generate2FACode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!show2FA) {
      // Paso 1: Verificar credenciales
      const user = authService.login(email, password);
      
      if (user) {
        // Credenciales correctas, generar código 2FA
        const code = generate2FACode();
        setGeneratedCode(code);
        setUserPendingLogin(user);
        setShow2FA(true);
        
        // Cerrar sesión temporalmente hasta que se complete 2FA
        authService.logout();
      } else {
        alert(isSpanish ? 'Credenciales incorrectas' : 'Invalid credentials');
      }
    } else {
      // Paso 2: Verificar código 2FA
      if (twoFactorCode === generatedCode) {
        // Código correcto, completar login
        authService.login(email, password); // Re-login para establecer sesión
        
        switch (userPendingLogin.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'contractor':
            navigate('/contractor');
            break;
          case 'assassin':
            navigate('/assasin');
            break;
          default:
            navigate('/');
        }
      } else {
        alert(isSpanish ? 'Código 2FA incorrecto' : 'Incorrect 2FA code');
      }
    }
  };

  const handleCancel2FA = () => {
    setShow2FA(false);
    setTwoFactorCode('');
    setGeneratedCode('');
    setUserPendingLogin(null);
  };

  const getButtonText = () => {
    if (show2FA) {
      return isSpanish ? 'Verificar Código' : 'Verify Code';
    }
    return isSpanish ? 'Iniciar sesión' : 'Log in';
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    show2FA,
    twoFactorCode,
    setTwoFactorCode,
    generatedCode,
    navigate,
    isSpanish,
    handleSubmit,
    handleCancel2FA,
    getButtonText
  };
};
