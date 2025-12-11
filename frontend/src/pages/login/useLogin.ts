import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { User } from '../../types';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [userPendingLogin, setUserPendingLogin] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { login, getRedirectPath } = useAuth();
  const { isSpanish } = useLanguage();

  // Generar código 2FA de 6 dígitos
  const generate2FACode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Verificar credenciales sin iniciar sesión completa
  const verifyCredentials = (): { valid: boolean; user?: User } => {
    const users = localStorage.getItem('users');
    const usersDict = users ? JSON.parse(users) : {};
    
    if (usersDict[email] && usersDict[email] === password) {
      const roles = localStorage.getItem('roles');
      const rolesDict = roles ? JSON.parse(roles) : {};
      const nicknames = localStorage.getItem('nicknames');
      const nicknamesDict = nicknames ? JSON.parse(nicknames) : {};
      const coins = localStorage.getItem('coins');
      const coinsDict = coins ? JSON.parse(coins) : {};
      
      const user: User = {
        id: btoa(email),
        email,
        name: email.split('@')[0],
        nickname: nicknamesDict[email] || email.split('@')[0],
        role: rolesDict[email] || 'assassin',
        coins: coinsDict[email] || 0
      };
      
      return { valid: true, user };
    }
    
    return { valid: false };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!show2FA) {
        // Paso 1: Solo verificar credenciales (sin iniciar sesión)
        const result = verifyCredentials();

        if (result.valid && result.user) {
          // Credenciales correctas, generar código 2FA
          const code = generate2FACode();
          setGeneratedCode(code);
          setUserPendingLogin(result.user);
          setShow2FA(true);
          
          // NO iniciar sesión todavía - esperar verificación 2FA
        } else {
          alert(isSpanish ? 'Credenciales incorrectas' : 'Invalid credentials');
        }
      } else {
        // Paso 2: Verificar código 2FA
        if (twoFactorCode === generatedCode) {
          // Código correcto, ahora sí iniciar sesión
          const success = await login({ email, password });
          
          if (success && userPendingLogin) {
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
                navigate(getRedirectPath());
            }
          } else {
            navigate(getRedirectPath());
          }
        } else {
          alert(isSpanish ? 'Código 2FA incorrecto' : 'Incorrect 2FA code');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(isSpanish ? 'Error al iniciar sesión' : 'Login error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel2FA = () => {
    setShow2FA(false);
    setTwoFactorCode('');
    setGeneratedCode('');
    setUserPendingLogin(null);
  };

  const getButtonText = () => {
    if (isLoading) {
      return isSpanish ? 'Cargando...' : 'Loading...';
    }
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
    isLoading,
    handleSubmit,
    handleCancel2FA,
    getButtonText,
  };
};
