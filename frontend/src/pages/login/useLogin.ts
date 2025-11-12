import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const isSpanish = navigator.language.toLowerCase().startsWith('es');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = authService.login(email, password);
    
    if (user) {
      switch (user.role) {
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
      alert(isSpanish ? 'Credenciales incorrectas' : 'Invalid credentials');
    }
  };

  const getButtonText = () => {
    return isSpanish ? 'Iniciar sesión' : 'Log in';
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    navigate,
    isSpanish,
    handleSubmit,
    getButtonText
  };
};
