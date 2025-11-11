import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

export const useHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSpanish = navigator.language.toLowerCase().startsWith('es');
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const refreshUser = () => {
    setCurrentUser(authService.getCurrentUser());
  };

  // Actualizar el usuario cuando cambie la ruta
  useEffect(() => {
    refreshUser();
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/');
  };

  const getPersonalPageRoute = () => {
    if (!currentUser) return '/';
    
    switch (currentUser.role) {
      case 'admin':
        return '/admin';
      case 'contractor':
        return '/contractor';
      case 'assassin':
        return '/assasin';
      default:
        return '/';
    }
  };

  const getPersonalPageLabel = () => {
    if (!currentUser) return '';
    
    if (isSpanish) {
      switch (currentUser.role) {
        case 'admin':
          return 'Panel Admin';
        case 'contractor':
          return 'Panel Contratista';
        case 'assassin':
          return 'Panel Asesino';
        default:
          return 'Mi Panel';
      }
    } else {
      switch (currentUser.role) {
        case 'admin':
          return 'Admin Panel';
        case 'contractor':
          return 'Contractor Panel';
        case 'assassin':
          return 'Assassin Panel';
        default:
          return 'My Panel';
      }
    }
  };

  return {
    navigate,
    isSpanish,
    currentUser,
    showBuyModal,
    setShowBuyModal,
    showProfileMenu,
    setShowProfileMenu,
    profileMenuRef,
    handleLogout,
    getPersonalPageRoute,
    getPersonalPageLabel,
    refreshUser
  };
};
